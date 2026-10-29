# Deploy on a VPS

One server, Docker Compose, photos on the server disk. Address: `https://bordo.thiagowilliam.com.br`.

```
internet ──443──> Caddy ──/api/*──> api (Nest)  ──> postgres, redis, volume api-storage (photos)
                    └─────everything else──> web (Next)
```

Only Caddy publishes ports (80, 443). Caddy gets and renews the HTTPS certificate by itself. `/api/*` goes straight to the API so it sees the real visitor address (rate limits work per visitor).

Files: `compose.prod.yaml`, `deploy/Caddyfile`, `deploy/.env.production.example`, `deploy/deploy.sh`, `deploy/backup.sh`, `apps/web/Dockerfile`, `apps/api/Dockerfile`.

## What a VPS is

A VPS (virtual private server) is a computer you rent by the month, always on, in a data center. You have no screen: you control it from your terminal over SSH, and Bordo runs inside it as Docker containers. The domain is only the name; the VPS is where the name points. Vercel hosts Next.js sites, but it does not run the Postgres, Redis and Nest API that Bordo needs, which is why the backend lives on a VPS.

## 1. Rent the server

1. Pick a provider. Near Brazil: Vultr or AWS Lightsail (São Paulo). Usually cheaper but abroad: Hetzner, DigitalOcean. Check the current prices on their sites.
2. Create a server with **Ubuntu 24.04**, **2 GB of RAM** (1 vCPU is enough). The first image build is the heaviest moment; on a 1 GB machine add 2 GB of swap.
3. Write down its **public IPv4 address**.

### SSH key (on your Mac, once)

The key replaces a password: the server accepts only whoever holds the private half.

```bash
ssh-keygen -t ed25519 -C "bordo-vps"      # Enter to accept the defaults
cat ~/.ssh/id_ed25519.pub                 # copy this whole line
```

Paste that line in the provider's "SSH key" field when creating the server (or add it later in its panel). Never share the file without `.pub`.

### First access and setup

```bash
ssh root@SERVER_IP          # answer "yes" to the fingerprint question
```

Then, as root:

```bash
adduser deploy                           # choose a password; the other questions can stay empty
usermod -aG sudo deploy
mkdir -p /home/deploy/.ssh && cp /root/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh && chmod 700 /home/deploy/.ssh
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw --force enable
curl -fsSL https://get.docker.com | sh && usermod -aG docker deploy
```

Open a **second terminal** and check `ssh deploy@SERVER_IP` works before closing the root one. From then on, use `deploy`. (Optional hardening: set `PermitRootLogin no` and `PasswordAuthentication no` in `/etc/ssh/sshd_config`, then `systemctl restart ssh`.)

## 2. DNS (the domain is on Vercel)

`thiagowilliam.com.br` uses Vercel's name servers, so the record is created **in the Vercel panel**, not at Registro.br. Leave the name servers at Registro.br as they are.

1. Check where the DNS lives: vercel.com, **Domains**, `thiagowilliam.com.br`. It should offer an **Add Record** form and show the Vercel name servers (`ns1.vercel-dns.com`, `ns2.vercel-dns.com`). At registro.br the domain must point to those same name servers.
2. **Add Record**: Name `bordo`, Type `A`, Value the server IPv4. (Add an `AAAA` record too only if the provider gave you an IPv6.)
3. This does not affect any site already on `thiagowilliam.com.br`: only the `bordo` name is new.
4. Check from your Mac: `dig +short bordo.thiagowilliam.com.br` prints the server IP. It usually takes minutes. Do this **before** the first start, or Caddy cannot get the HTTPS certificate.

## 3. E-mail (required)

The API refuses to start in production without `MAIL_SMTP_URL` and `MAIL_FROM`. Account e-mails (password recovery, change of e-mail) go through any SMTP provider (Resend, Brevo, SES). With Resend, for example:

1. Create an account and add the domain `thiagowilliam.com.br` (or a sending subdomain it suggests).
2. It lists DNS records (SPF, DKIM, sometimes MX). Add each one in the same **Vercel Domains** panel, with the exact name, type and value shown. Wait until Resend marks the domain as verified.
3. Create an API key and build the SMTP URL: `smtps://resend:API_KEY@smtp.resend.com:465`.
4. Use a sender on the verified domain: `Bordo <nao-responda@thiagowilliam.com.br>`.

Both values go in `.env.production` (next step). Quote the sender, since it has spaces.

## 4. First start

```bash
# as deploy
git clone git@github.com:thiagowilliam/bordo-financy.git bordo && cd bordo
cp deploy/.env.production.example .env.production
nano .env.production        # DOMAIN, POSTGRES_PASSWORD, MAIL_SMTP_URL, MAIL_FROM
chmod 600 .env.production
docker compose -f compose.prod.yaml --env-file .env.production up -d --build
docker compose -f compose.prod.yaml --env-file .env.production ps
```

`migrate` runs and exits before `api` starts. Open `https://bordo.thiagowilliam.com.br`.

## 5. Updating

```bash
cd ~/bordo && ./deploy/deploy.sh
```

Pulls `main`, rebuilds what changed, runs new migrations, and recreates the containers that changed. Roll back with `git checkout <commit>` and `docker compose ... up -d --build`. A migration is not undone by that: restore the dump (below) if one has to go.

## 6. Backups

`./deploy/backup.sh` writes a database dump and a tar of the photos into `~/bordo/backups` and keeps 14 days. Schedule it:

```bash
crontab -e
0 3 * * * /home/deploy/bordo/deploy/backup.sh >> /home/deploy/bordo/backups/backup.log 2>&1
```

Those backups live on the same disk. Copy `backups/` somewhere else too (`rsync` to another machine, `rclone` to a bucket), or the VPS provider's snapshot is your only protection. Restore:

```bash
c="docker compose -f compose.prod.yaml --env-file .env.production"
$c exec -T postgres pg_restore -U bordo -d bordo --clean --if-exists < backups/db-<stamp>.dump
$c exec -T api tar -C /app/storage -xf - < backups/photos-<stamp>.tar
```

## 7. Operating

```bash
c="docker compose -f compose.prod.yaml --env-file .env.production"
$c logs -f api          # or web, caddy
$c ps
$c restart api
curl https://bordo.thiagowilliam.com.br/api/health/ready
```

## Notes

- **One instance only.** Photos are a folder in the `api-storage` volume, so do not run more than one `api` container. The S3 compatible driver (listed in `docs/backend.md`) is what lifts that.
- **`BACKEND_URL` is baked into the web image** (the `/api/*` rewrite is resolved at build time). It is `http://api:3001` in `compose.prod.yaml`; change it in both places if the service name changes.
- **`TRUST_PROXY`** lists the private ranges Docker uses, because the API has no published port and only Caddy reaches it.
- `.env.production` and `backups/` are git ignored. Never commit them.
- Keep the system updated (`unattended-upgrades`) and watch the disk: photos, the database and Docker images all grow.
