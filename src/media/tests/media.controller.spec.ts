import { Test, TestingModule } from '@nestjs/testing';

import { MediaController } from '../media.controller';
import { MediaService } from '../media.service';

describe('MediaController', () => {
  let controller: MediaController;

  const mockMediaService = {
    getImageUrl: jest.fn(),
    uploadAvatar: jest.fn(),
    deleteImage: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [
        {
          provide: MediaService,
          useValue: mockMediaService,
        },
      ],
    }).compile();

    controller = module.get<MediaController>(MediaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getImageUrl', () => {
    const fileKey = 'avatar/test-image.webp';
    const signedUrl = 'https://test-bucket.s3.amazonaws.com/avatar/test-image.webp?signed=true';

    it('should return file URL for given file key', async () => {
      mockMediaService.getImageUrl.mockResolvedValue(signedUrl);

      const result = await controller.getImageUrl({ fileKey });

      expect(result).toEqual({ fileUrl: signedUrl });
      expect(mockMediaService.getImageUrl).toHaveBeenCalledWith(fileKey);
      expect(mockMediaService.getImageUrl).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors from media service', async () => {
      const error = new Error('S3 error');
      mockMediaService.getImageUrl.mockRejectedValue(error);

      await expect(controller.getImageUrl({ fileKey })).rejects.toThrow(error);
      expect(mockMediaService.getImageUrl).toHaveBeenCalledWith(fileKey);
    });
  });

  describe('uploadAvatar', () => {
    const uploadRequest = {
      id: 'user-123',
      buffer: new Uint8Array(Buffer.from('test-image-data')),
      fieldName: 'profile',
      originalName: 'photo.jpg',
      mimeType: 'image/jpeg',
      size: 1024,
    };
    const fileName = 'user-123-profile.webp';

    it('should upload avatar and return file URL', async () => {
      mockMediaService.uploadAvatar.mockResolvedValue(fileName);

      const result = await controller.uploadAvatar(uploadRequest);

      expect(result).toEqual({ fileUrl: fileName });
      expect(mockMediaService.uploadAvatar).toHaveBeenCalledWith(uploadRequest);
      expect(mockMediaService.uploadAvatar).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors from media service', async () => {
      const error = new Error('Upload failed');
      mockMediaService.uploadAvatar.mockRejectedValue(error);

      await expect(controller.uploadAvatar(uploadRequest)).rejects.toThrow(error);
      expect(mockMediaService.uploadAvatar).toHaveBeenCalledWith(uploadRequest);
    });
  });

  describe('deleteAvatar', () => {
    const fileKey = 'avatar/test-image.webp';

    it('should delete avatar and return success response', async () => {
      const deleteResult = { success: true, message: 'Image deleted successfully' };
      mockMediaService.deleteImage.mockResolvedValue(deleteResult);

      const result = await controller.deleteAvatar({ fileKey });

      expect(result).toEqual({ success: true, message: 'Image deleted successfully' });
      expect(mockMediaService.deleteImage).toHaveBeenCalledWith(fileKey);
      expect(mockMediaService.deleteImage).toHaveBeenCalledTimes(1);
    });

    it('should return failure response when deletion fails', async () => {
      const deleteResult = { success: false, message: 'Image not found' };
      mockMediaService.deleteImage.mockResolvedValue(deleteResult);

      const result = await controller.deleteAvatar({ fileKey });

      expect(result).toEqual({ success: false, message: 'Image not found' });
      expect(mockMediaService.deleteImage).toHaveBeenCalledWith(fileKey);
    });

    it('should propagate errors from media service', async () => {
      const error = new Error('Delete failed');
      mockMediaService.deleteImage.mockRejectedValue(error);

      await expect(controller.deleteAvatar({ fileKey })).rejects.toThrow(error);
      expect(mockMediaService.deleteImage).toHaveBeenCalledWith(fileKey);
    });
  });
});
