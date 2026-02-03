import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { HEALTH_CHECK_SERVICE_NAME, type HealthCheckResponse } from 'src/generated-types/health-check';

@Controller()
export class HealthCheckController {
  protected readonly logger = new Logger(HealthCheckController.name);

  @GrpcMethod(HEALTH_CHECK_SERVICE_NAME, 'CheckAppHealth')
  checkHealth(): HealthCheckResponse {
    this.logger.log('Health check requested');
    return {
      serving: true,
      message: 'Media microservice is healthy',
    };
  }
}
