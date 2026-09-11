import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export interface StorageService {
  uploadFile(localPath: string, key: string): Promise<string>;
}

class StorageServiceImpl implements StorageService {
  private s3Client: S3Client | null = null;

  private getS3Client(): S3Client | null {
    if (this.s3Client) {
      return this.s3Client;
    }

    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const bucketName = process.env.AWS_BUCKET_NAME;

    if (!accessKeyId || !secretAccessKey || !bucketName) {
      return null;
    }

    const region = process.env.AWS_REGION || 'us-east-1';
    const endpoint = process.env.AWS_ENDPOINT;
    const forcePathStyle = process.env.AWS_FORCE_PATH_STYLE === 'true';

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      endpoint,
      forcePathStyle,
    });

    return this.s3Client;
  }

  async uploadFile(localPath: string, key: string): Promise<string> {
    if (!fs.existsSync(localPath)) {
      throw new Error(`Local file to upload does not exist: ${localPath}`);
    }

    const s3Client = this.getS3Client();
    const bucketName = process.env.AWS_BUCKET_NAME;

    if (s3Client && bucketName) {
      console.log(`[Storage] Starting S3/R2 upload: ${localPath} -> s3://${bucketName}/${key}`);
      
      const fileStream = fs.createReadStream(localPath);
      const ext = path.extname(localPath).toLowerCase();
      let contentType = 'application/octet-stream';
      if (ext === '.mp4') contentType = 'video/mp4';
      else if (ext === '.mp3') contentType = 'audio/mp3';
      else if (ext === '.json') contentType = 'application/json';
      else if (ext === '.ass') contentType = 'text/plain';

      try {
        await s3Client.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: fileStream,
            ContentType: contentType,
          })
        );

        console.log(`[Storage] S3/R2 upload finished successfully: key=${key}`);

        // Construct public URL
        const publicUrlPrefix = process.env.AWS_PUBLIC_URL_PREFIX;
        if (publicUrlPrefix) {
          const basePrefix = publicUrlPrefix.endsWith('/') ? publicUrlPrefix.slice(0, -1) : publicUrlPrefix;
          const cleanKey = key.startsWith('/') ? key.slice(1) : key;
          return `${basePrefix}/${cleanKey}`;
        }

        const endpoint = process.env.AWS_ENDPOINT;
        if (endpoint) {
          const baseEndpoint = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
          const cleanKey = key.startsWith('/') ? key.slice(1) : key;
          const forcePathStyle = process.env.AWS_FORCE_PATH_STYLE === 'true';
          if (forcePathStyle) {
            return `${baseEndpoint}/${bucketName}/${cleanKey}`;
          } else {
            const url = new URL(baseEndpoint);
            return `${url.protocol}//${bucketName}.${url.host}/${cleanKey}`;
          }
        }

        const region = process.env.AWS_REGION || 'us-east-1';
        return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
      } catch (err) {
        console.error('[Storage] Error during S3/R2 upload, falling back to local storage:', err);
      }
    }

    // Local Persistence Fallback (when S3 is not configured or fails)
    const targetDir = path.join(__dirname, '../../uploads');
    const localDestPath = path.join(targetDir, key);

    console.log(`[Storage] Local upload fallback active. Saving: ${localPath} -> ${localDestPath}`);

    const destDir = path.dirname(localDestPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    fs.copyFileSync(localPath, localDestPath);

    return `/uploads/${key}`;
  }
}

export const storageService = new StorageServiceImpl();
