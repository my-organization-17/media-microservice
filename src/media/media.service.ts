import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';

import { AppError } from 'src/utils/errors/app-error';
import type { StatusResponse, UploadAvatarRequest } from 'src/generated-types/media';

@Injectable()
export class MediaService {
  protected readonly logger = new Logger(MediaService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow<string>('AWS_SECRET_ACCESS_KEY'),
      },
      region: this.configService.getOrThrow<string>('AWS_REGION'),
    });
    this.bucketName = this.configService.getOrThrow<string>('S3_BUCKET_NAME');
  }

  async getImageUrl(fileKey: string): Promise<string> {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: fileKey,
      };
      const command = new GetObjectCommand(params);
      const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 }); // URL valid for 1 hour

      return url;
    } catch (error) {
      this.logger.error(error instanceof Error ? error.message : error);
      throw AppError.internalServerError("Can't get image URL");
    }
  }

  async uploadAvatar(data: UploadAvatarRequest): Promise<string> {
    if (!data.buffer) {
      throw AppError.badRequest('No file buffer provided');
    }
    const buffer = Buffer.from(data.buffer);

    try {
      const fileName = data.id + '-' + data.fieldName + '.webp';
      const avatarPath = `avatar/${fileName}`;

      const fileBuffer = await sharp(buffer).webp().resize(200).toBuffer(); // Resize avatar to 200px width

      const params = {
        Bucket: this.bucketName,
        Key: avatarPath,
        Body: fileBuffer,
        ContentType: 'image/webp',
      };
      const command = new PutObjectCommand(params);
      await this.s3Client.send(command);

      return fileName;
    } catch (error) {
      this.logger.error(error instanceof Error ? error.message : error);
      if (error instanceof AppError) throw error;
      throw AppError.internalServerError("Can't upload avatar");
    }
  }

  async deleteImage(fileKey: string): Promise<StatusResponse> {
    const params = {
      Bucket: this.bucketName,
      Key: fileKey,
    };
    const command = new DeleteObjectCommand(params);
    try {
      await this.s3Client.send(command);
      return {
        success: true,
        message: 'Image deleted successfully',
      };
    } catch (error) {
      this.logger.error(error instanceof Error ? error.message : error);
      throw AppError.internalServerError("Can't delete image");
    }
  }
}
