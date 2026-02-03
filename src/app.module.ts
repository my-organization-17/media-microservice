import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppService } from './app.service';
import { validateEnv } from './utils/validators/env-validator';
import { EnvironmentVariables } from './utils/env.dto';
import { HealthCheckModule } from './health-check/health-check.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local'],
      validate: (config) => validateEnv(config, EnvironmentVariables),
    }),
    HealthCheckModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
