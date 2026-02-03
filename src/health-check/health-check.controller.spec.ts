import { Test, TestingModule } from '@nestjs/testing';

import { HealthCheckController } from './health-check.controller';

describe('HealthCheckController', () => {
  let controller: HealthCheckController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthCheckController],
    }).compile();

    controller = module.get<HealthCheckController>(HealthCheckController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkHealth', () => {
    it('should return a healthy response', () => {
      const result = controller.checkHealth();

      expect(result).toEqual({
        serving: true,
        message: 'Media microservice is healthy',
      });
    });

    it('should return serving as true', () => {
      const result = controller.checkHealth();

      expect(result.serving).toBe(true);
    });

    it('should return the correct health message', () => {
      const result = controller.checkHealth();

      expect(result.message).toBe('Media microservice is healthy');
    });
  });
});
