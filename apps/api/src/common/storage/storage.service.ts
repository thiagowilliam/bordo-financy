/** Where uploaded files live. The only code that knows is the driver behind this class. */
export abstract class StorageService {
  /** Stores `body` under `key` (like `trips/<trip>/<uuid>.jpg`), replacing anything there. */
  abstract put(key: string, body: Buffer, contentType: string): Promise<void>;
  /** Removes a file. Missing files are not an error. */
  abstract delete(key: string): Promise<void>;
}
