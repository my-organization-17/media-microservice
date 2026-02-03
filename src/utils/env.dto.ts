import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  readonly NODE_ENV: string;

  @IsString()
  @IsNotEmpty()
  readonly TRANSPORT_URL: string;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  readonly HTTP_PORT: number;

  @IsString()
  @IsNotEmpty()
  readonly AWS_ACCESS_KEY_ID: string;

  @IsString()
  @IsNotEmpty()
  readonly AWS_SECRET_ACCESS_KEY: string;

  @IsString()
  @IsNotEmpty()
  readonly AWS_REGION: string;

  @IsString()
  @IsNotEmpty()
  readonly S3_BUCKET_NAME: string;
}
