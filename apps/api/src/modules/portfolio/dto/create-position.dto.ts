import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePositionDto {
  @ApiProperty({ example: 'BTC' })
  @IsString()
  @IsNotEmpty()
  symbol: string;

  @ApiProperty({ example: 0.75 })
  @IsNumber()
  @Min(0.00000001)
  quantity: number;

  @ApiProperty({ example: 64200 })
  @IsNumber()
  @Min(0.01)
  costBasis: number;
}
