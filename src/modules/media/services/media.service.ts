import { prisma } from "@/lib/prisma";
import { CreateMediaDTO, BatchCreateMediaDTO, UpdateMediaDTO, RequestPresignedUrlDTO } from "../types/media";
import { S3Client, PutObjectCommand, HeadBucketCommand, CreateBucketCommand, PutBucketPolicyCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const r2Client = new S3Client({
  region: process.env.R2_REGION || "us-east-1",
  endpoint: process.env.R2_ENDPOINT || "http://127.0.0.1:9090",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "talas_storage_user",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "talas_storage_password",
  },
  forcePathStyle: true, // Required for path-style S3 / MinIO local emulator
});

/**
 * Core domain business logic & strictly isolated WRITE operations for Media domain.
 */
export const mediaService = {
  async getById(id: string) {
    return prisma.media.findUnique({
      where: { id },
    });
  },

  async create(data: CreateMediaDTO) {
    return prisma.media.create({
      data: {
        artifact_id: data.artifact_id || null,
        url: data.url,
        size: data.size || 0,
        caption: data.caption,
        order: data.order || 0,
      },
    });
  },

  async batchCreate(data: BatchCreateMediaDTO) {
    const createPromises = data.items.map((item) =>
      prisma.media.create({
        data: {
          artifact_id: data.artifact_id,
          url: item.url,
          size: item.size || 0,
          caption: item.caption,
          order: item.order || 0,
        },
      })
    );
    return Promise.all(createPromises);
  },

  async update(id: string, data: UpdateMediaDTO) {
    return prisma.media.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    const media = await prisma.media.findUnique({ where: { id } });
    if (media) {
      if (media.url && !media.url.startsWith("http://") && !media.url.startsWith("https://")) {
        try {
          const bucketName = process.env.R2_BUCKET_NAME || "talas-media";
          await r2Client.send(
            new DeleteObjectCommand({
              Bucket: bucketName,
              Key: media.url,
            })
          );
        } catch (e) {
          console.error("Failed to delete object from storage:", e);
        }
      }
      await prisma.media.delete({
        where: { id },
      });
    }
    return true;
  },

  async getPresignedUploadUrl(data: RequestPresignedUrlDTO) {
    const bucketName = process.env.R2_BUCKET_NAME || "talas-media";

    // Ensure bucket exists automatically & set public read policy
    try {
      await r2Client.send(new HeadBucketCommand({ Bucket: bucketName }));
    } catch (e) {
      try {
        await r2Client.send(new CreateBucketCommand({ Bucket: bucketName }));
        const policy = JSON.stringify({
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: "*",
              Action: ["s3:GetObject"],
              Resource: [`arn:aws:s3:::${bucketName}/*`],
            },
          ],
        });
        await r2Client.send(new PutBucketPolicyCommand({ Bucket: bucketName, Policy: policy }));
      } catch (createErr) {
        // Ignore if already existing
      }
    }

    const fileExt = data.filename.split(".").pop() || "webp";
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    
    const fileKey = data.artifact_id
      ? `artifacts/${data.artifact_id}/${uniqueFileName}`
      : `avatars/${uniqueFileName}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      ContentType: data.fileType || "image/webp",
    });

    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 900 }); // 15 minutes
    
    const publicDomain = process.env.R2_PUBLIC_DOMAIN || `http://localhost:9090/${bucketName}`;
    const publicUrl = `${publicDomain}/${fileKey}`;

    return {
      uploadUrl,
      fileKey,
      publicUrl,
    };
  },
};
