import { Injectable } from "@nestjs/common";
import { hash, verify } from "@node-rs/argon2";

/**
 * Argon2id with the library defaults (19 MiB, 2 passes, 1 lane: the OWASP minimum profile).
 * The algorithm is Argon2id unless told otherwise.
 */
@Injectable()
export class PasswordService {
  private dummyHash?: Promise<string>;

  hash(password: string) {
    return hash(password);
  }

  verify(hashed: string, password: string) {
    return verify(hashed, password).catch(() => false);
  }

  /**
   * Spend the same time as a real check when the account does not exist (or has no password),
   * so response time does not reveal which e-mails are registered.
   */
  async verifyAgainstDummy(password: string) {
    this.dummyHash ??= hash("bordo-timing-equalizer");
    await verify(await this.dummyHash, password).catch(() => false);
    return false;
  }
}
