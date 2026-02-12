export interface StorageConfig {
  provider: "r2";
  bucket: string;
  region: string;
  endpoint: string;
  access_key: string;
  secret_key: string;
  public_url?: string;
}

export interface StorageClient {
  uploadJSON(key: string, data: any): Promise<void>;
  uploadText(key: string, data: string): Promise<void>;
  downloadJSON<T>(key: string): Promise<T>;
  downloadText(key: string): Promise<string>;
  listKeys(prefix: string): Promise<string[]>;
}
