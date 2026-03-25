import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Environment variables
const AWS_REGION = process.env.AWS_REGION || "eu-west-1";
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || "";
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || "";
const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "devakent-lms-videos";
const AWS_CLOUDFRONT_DOMAIN = process.env.AWS_CLOUDFRONT_DOMAIN || "";
const USE_MOCK_S3 = process.env.USE_MOCK_S3 === "true";

// S3 Client (singleton)
let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (USE_MOCK_S3) {
    // Mock mode - return a dummy client
    console.warn("⚠️ S3 Mock Mode Active - Using simulated S3");
    return {} as S3Client;
  }

  if (!s3Client) {
    s3Client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  return s3Client;
}

// ============================================================================
// Generate Presigned URL for Upload
// ============================================================================

export interface GeneratePresignedUrlOptions {
  key: string; // S3 object key (path)
  contentType: string; // MIME type (e.g., video/mp4)
  expiresIn?: number; // Seconds (default: 3600 = 1 hour)
}

export interface PresignedUrlResult {
  url: string;
  key: string;
  bucket: string;
  publicUrl: string; // CloudFront URL or S3 URL
}

export async function generatePresignedUploadUrl(
  options: GeneratePresignedUrlOptions
): Promise<PresignedUrlResult> {
  const { key, contentType, expiresIn = 3600 } = options;

  // Mock mode
  if (USE_MOCK_S3) {
    const mockUrl = `https://mock-s3.amazonaws.com/${AWS_S3_BUCKET_NAME}/${key}`;
    const publicUrl = AWS_CLOUDFRONT_DOMAIN
      ? `https://${AWS_CLOUDFRONT_DOMAIN}/${key}`
      : mockUrl;

    return {
      url: mockUrl,
      key,
      bucket: AWS_S3_BUCKET_NAME,
      publicUrl,
    };
  }

  // Real S3
  try {
    const client = getS3Client();

    const command = new PutObjectCommand({
      Bucket: AWS_S3_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(client, command, { expiresIn });

    const publicUrl = AWS_CLOUDFRONT_DOMAIN
      ? `https://${AWS_CLOUDFRONT_DOMAIN}/${key}`
      : `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;

    return {
      url,
      key,
      bucket: AWS_S3_BUCKET_NAME,
      publicUrl,
    };
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw new Error("S3 presigned URL generation failed");
  }
}

// ============================================================================
// Delete Object from S3
// ============================================================================

export async function deleteFromS3(key: string): Promise<boolean> {
  // Mock mode
  if (USE_MOCK_S3) {
    console.log(`[MOCK] Deleting S3 object: ${key}`);
    return true;
  }

  // Real S3
  try {
    const client = getS3Client();

    const command = new DeleteObjectCommand({
      Bucket: AWS_S3_BUCKET_NAME,
      Key: key,
    });

    await client.send(command);
    return true;
  } catch (error) {
    console.error("Error deleting from S3:", error);
    return false;
  }
}

// ============================================================================
// Generate Unique Key for Upload
// ============================================================================

export interface GenerateKeyOptions {
  hospitalId: string;
  trainingId?: string;
  fileName: string;
  prefix?: string;
}

export function generateS3Key(options: GenerateKeyOptions): string {
  const { hospitalId, trainingId, fileName, prefix = "videos" } = options;

  // Sanitize filename
  const sanitized = fileName
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "-")
    .replace(/-+/g, "-");

  // Timestamp for uniqueness
  const timestamp = Date.now();

  // Build key
  const parts = [prefix, hospitalId];
  if (trainingId) parts.push(trainingId);
  parts.push(`${timestamp}-${sanitized}`);

  return parts.join("/");
}

// ============================================================================
// Validate File for Upload
// ============================================================================

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateVideoFile(
  file: File,
  options?: {
    maxSizeMB?: number;
    allowedTypes?: string[];
  }
): FileValidationResult {
  const { maxSizeMB = 500, allowedTypes = ["video/mp4", "video/webm", "video/ogg", "video/mov", "video/quicktime"] } =
    options || {};

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Desteklenmeyen dosya formatı. İzin verilenler: ${allowedTypes.join(", ")}`,
    };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `Dosya çok büyük. Maksimum: ${maxSizeMB}MB`,
    };
  }

  return { isValid: true };
}

// ============================================================================
// Upload File to S3 (Client-side helper)
// ============================================================================

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export async function uploadFileToS3(
  file: File,
  presignedUrl: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Progress tracking
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        const percentage = Math.round((e.loaded / e.total) * 100);
        onProgress({
          loaded: e.loaded,
          total: e.total,
          percentage,
        });
      }
    });

    // Success
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(true);
      } else {
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
      }
    });

    // Error
    xhr.addEventListener("error", () => {
      reject(new Error("Upload failed: Network error"));
    });

    // Abort
    xhr.addEventListener("abort", () => {
      reject(new Error("Upload aborted"));
    });

    // Start upload
    xhr.open("PUT", presignedUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
}

// ============================================================================
// Get Video Metadata (duration, etc.)
// ============================================================================

export interface VideoMetadata {
  duration: number; // seconds
  width: number;
  height: number;
  size: number; // bytes
}

export function getVideoMetadata(file: File): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      resolve({
        duration: Math.floor(video.duration),
        width: video.videoWidth,
        height: video.videoHeight,
        size: file.size,
      });

      // Cleanup
      URL.revokeObjectURL(video.src);
    };

    video.onerror = () => {
      reject(new Error("Video metadata extraction failed"));
    };

    video.src = URL.createObjectURL(file);
  });
}

// ============================================================================
// Helper: Format file size
// ============================================================================

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
