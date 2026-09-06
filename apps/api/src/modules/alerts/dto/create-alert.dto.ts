import { IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AlertCondition } from '@cryptovision/shared-types';

export class CreateAlertDto {
  @ApiProperty({ example: 'BTC' })
  @IsString()
  @IsNotEmpty()
  symbol: string;

  @ApiProperty({ example: 'price_above', enum: ['price_above', 'price_below', 'volume_spike', 'pct_change'] })
  @IsEnum(['price_above', 'price_below', 'volume_spike', 'pct_change'])
  condition: AlertCondition;

  @ApiProperty({ example: 70000 })
  @IsNumber()
  threshold: number;

  @ApiProperty({ example: 'email', enum: ['email', 'push', 'webhook'], required: false })
  @IsOptional()
  @IsEnum(['email', 'push', 'webhook'])
  channel?: 'email' | 'push' | 'webhook';
}
