import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { MediaService } from './media.service';
import { MEDIA_SERVICE_NAME, type FileKey, type FileUrl, type UploadAvatarRequest } from 'src/generated-types/media';

@Controller()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}
  protected readonly logger = new Logger(MediaController.name);

  @GrpcMethod(MEDIA_SERVICE_NAME, 'GetImageUrl')
  async getImageUrl(data: FileKey): Promise<FileUrl> {
    this.logger.log(`Getting image URL for fileKey: ${data.fileKey}`);
    const fileUrl = await this.mediaService.getImageUrl(data.fileKey);
    return { fileUrl };
  }

  @GrpcMethod(MEDIA_SERVICE_NAME, 'UploadAvatar')
  async uploadAvatar(data: UploadAvatarRequest): Promise<FileUrl> {
    this.logger.log(`Uploading avatar for user ID: ${data.id}`);

    const fileUrl = await this.mediaService.uploadAvatar(data);
    return { fileUrl };
  }

  @GrpcMethod(MEDIA_SERVICE_NAME, 'DeleteAvatar')
  async deleteAvatar(data: FileKey): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Deleting avatar with fileKey: ${data.fileKey}`);
    const result = await this.mediaService.deleteImage(data.fileKey);
    return { success: result.success, message: result.message };
  }
}
