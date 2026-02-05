import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import type { StorageClient, StorageConfig } from "../../types/src/storage";

export class R2Client implements StorageClient {
    private client: S3Client;
    private bucket: string;

    constructor(config: StorageConfig) {
        this.bucket = config.bucket;

        if (config.provider === "mock") {
            // We can maybe support a minimal mock purely in memory if needed, 
            // but for now we will rely on S3Client being usable with proper endpoint
            // If credentials are bad, it will throw.
            throw new Error("Mock provider not fully implemented in R2Client yet. Use 'r2' with valid creds or a local MinIO.");
        }

        this.client = new S3Client({
            region: config.region,
            endpoint: config.endpoint,
            credentials: {
                accessKeyId: config.access_key,
                secretAccessKey: config.secret_key
            }
        });
    }

    async uploadJSON(key: string, data: any): Promise<void> {
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: JSON.stringify(data, null, 2),
            ContentType: "application/json"
        });
        await this.client.send(command);
    }

    async uploadText(key: string, data: string): Promise<void> {
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: data,
            ContentType: "text/plain" // Or auto-detect
        });
        await this.client.send(command);
    }

    async downloadJSON<T>(key: string): Promise<T> {
        const command = new GetObjectCommand({
            Bucket: this.bucket,
            Key: key
        });
        const response = await this.client.send(command);
        if (!response.Body) throw new Error(`Key ${key} not found or empty`);
        const str = await response.Body.transformToString();
        return JSON.parse(str) as T;
    }

    async downloadText(key: string): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.bucket,
            Key: key
        });
        const response = await this.client.send(command);
        if (!response.Body) throw new Error(`Key ${key} not found or empty`);
        return await response.Body.transformToString();
    }

    async listKeys(prefix: string): Promise<string[]> {
        const command = new ListObjectsV2Command({
            Bucket: this.bucket,
            Prefix: prefix
        });
        const response = await this.client.send(command);
        return response.Contents?.map(c => c.Key || "").filter(Boolean) || [];
    }
}
