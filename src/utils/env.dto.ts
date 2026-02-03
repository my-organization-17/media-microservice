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
}
