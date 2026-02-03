/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

import { MediaService } from '../media.service';
import { AppError } from 'src/utils/errors/app-error';

const mockSend = jest.fn();
const mockGetSignedUrl = jest.fn();

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: mockSend,
  })),
  GetObjectCommand: jest.fn().mockImplementation((params: Record<string, unknown>) => ({
    ...params,
    type: 'GetObjectCommand',
  })),
  PutObjectCommand: jest.fn().mockImplementation((params: Record<string, unknown>) => ({
    ...params,
    type: 'PutObjectCommand',
  })),
  DeleteObjectCommand: jest.fn().mockImplementation((params: Record<string, unknown>) => ({
    ...params,
    type: 'DeleteObjectCommand',
  })),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: (...args: unknown[]): unknown => mockGetSignedUrl(...args),
}));

const mockSharpInstance = {
  webp: jest.fn().mockReturnThis(),
  resize: jest.fn().mockReturnThis(),
  toBuffer: jest.fn().mockResolvedValue(Buffer.from('processed-image')),
};

jest.mock('sharp', () => jest.fn((): typeof mockSharpInstance => mockSharpInstance));

describe('MediaService', () => {
  let service: MediaService;

  const mockConfigService = {
    getOrThrow: jest.fn((key: string) => {
      const config: Record<string, string> = {
        AWS_ACCESS_KEY_ID: 'test-access-key',
        AWS_SECRET_ACCESS_KEY: 'test-secret-key',
        AWS_REGION: 'us-east-1',
        S3_BUCKET_NAME: 'test-bucket',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getImageUrl', () => {
    const fileKey = 'avatar/test-image.webp';
    const signedUrl = 'https://test-bucket.s3.amazonaws.com/avatar/test-image.webp?signed=true';

    it('should return a signed URL for the given file key', async () => {
      mockGetSignedUrl.mockResolvedValue(signedUrl);

      const result = await service.getImageUrl(fileKey);

      expect(result).toBe(signedUrl);
      expect(mockGetSignedUrl).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          Bucket: 'test-bucket',
          Key: fileKey,
          type: 'GetObjectCommand',
        }),
        { expiresIn: 3600 },
      );
    });

    it('should throw AppError when S3 operation fails', async () => {
      mockGetSignedUrl.mockRejectedValue(new Error('S3 error'));

      await expect(service.getImageUrl(fileKey)).rejects.toThrow(AppError);
      await expect(service.getImageUrl(fileKey)).rejects.toMatchObject({
        error: expect.objectContaining({
          message: "Can't get image URL",
        }),
      });
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

    it('should upload avatar and return filename', async () => {
      mockSend.mockResolvedValue({});

      const result = await service.uploadAvatar(uploadRequest);

      expect(result).toBe('user-123-profile.webp');
      expect(mockSharpInstance.webp).toHaveBeenCalled();
      expect(mockSharpInstance.resize).toHaveBeenCalledWith(200);
      expect(mockSharpInstance.toBuffer).toHaveBeenCalled();
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          Bucket: 'test-bucket',
          Key: 'avatar/user-123-profile.webp',
          ContentType: 'image/webp',
          type: 'PutObjectCommand',
        }),
      );
    });

    it('should throw AppError.badRequest when no buffer provided', async () => {
      const requestWithoutBuffer = {
        ...uploadRequest,
        buffer: undefined as unknown as Uint8Array,
      };

      await expect(service.uploadAvatar(requestWithoutBuffer)).rejects.toThrow(AppError);
      await expect(service.uploadAvatar(requestWithoutBuffer)).rejects.toMatchObject({
        error: expect.objectContaining({
          message: 'No file buffer provided',
        }),
      });
    });

    it('should throw AppError when S3 upload fails', async () => {
      mockSend.mockRejectedValue(new Error('Upload failed'));

      await expect(service.uploadAvatar(uploadRequest)).rejects.toThrow(AppError);
      await expect(service.uploadAvatar(uploadRequest)).rejects.toMatchObject({
        error: expect.objectContaining({
          message: "Can't upload avatar",
        }),
      });
    });

    it('should re-throw AppError if it is already an AppError', async () => {
      const appError = AppError.badRequest('Custom error');
      mockSharpInstance.toBuffer.mockRejectedValueOnce(appError);

      await expect(service.uploadAvatar(uploadRequest)).rejects.toThrow(appError);
    });
  });

  describe('deleteImage', () => {
    const fileKey = 'avatar/test-image.webp';

    it('should delete image and return success response', async () => {
      mockSend.mockResolvedValue({});

      const result = await service.deleteImage(fileKey);

      expect(result).toEqual({
        success: true,
        message: 'Image deleted successfully',
      });
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          Bucket: 'test-bucket',
          Key: fileKey,
          type: 'DeleteObjectCommand',
        }),
      );
    });

    it('should throw AppError when S3 delete fails', async () => {
      mockSend.mockRejectedValue(new Error('Delete failed'));

      await expect(service.deleteImage(fileKey)).rejects.toThrow(AppError);
      await expect(service.deleteImage(fileKey)).rejects.toMatchObject({
        error: expect.objectContaining({
          message: "Can't delete image",
        }),
      });
    });
  });
});
