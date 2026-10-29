# Deploy on a VPS

One server, Docker Compose, photos on the server disk. Address: `https://bordo.thiagowilliam.com.br`.

```
internet ──443──> Caddy ──/api/*──> api (Nest)  ──> postgres, redis, volume api-storage (photos)
                    └─────everything else──> web (Next)
```

Only Caddy publishes ports (80, 443). Caddy gets and renews the HTTPS certificate by itself. `/api/*` goes straight to the API so it sees the real visitor address (rate limits work per visitor).

Files: `compose.prod.yaml`, `deploy/Caddyfile`, `deploy/.env.production.example`, `deploy/deploy.sh`, `deploy/backup.sh`, `apps/web/Dockerfile`, `apps/api/Dockerfile`.

## 1. Server

Any Ubuntu 24.04 VPS with 1 vCPU and 2 GB RAM is enough (the first image build is the heaviest part; add 2 GB of swap on a 1 GB machine).

```bash
# as root, once
adduser deploy && usermod -aG sudo deploy
# copy your SSH key to `deploy`, then disable password login in /etc/ssh/sshd_config
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw --force enable
curl -fsSL https://get.docker.com | sh && usermod -aG docker deploy
```

## 2. DNS (Registro.br)

1. registro.br, domain `thiagowilliam.com.br`, **DNS**. If it says "Utilizar DNS do Registro.br", use **Editar zona**. If the nameservers point to another provider (Cloudflare, for example), edit the zone there instead.
2. New entry, name `bordo`, type **A** with the server IPv4 (and **AAAA** with its IPv6, if any).
3. Check: `dig +short bordo.thiagowilliam.com.br` returns the server IP. Do this **before** the first start, or Caddy cannot get the certificate.

## 3. E-mail (required)

The API refuses to start in production without `MAIL_SMTP_URL` and `MAIL_FROM`. Create an account at an SMTP provider (Resend, Brevo, SES), verify the domain `thiagowilliam.com.br` there, and add the SPF and DKIM records it shows to the same Registro.br zone. Use a sender such as `Bordo <nao-responda@thiagowilliam.com.br>`.

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
