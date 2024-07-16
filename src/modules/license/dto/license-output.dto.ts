import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class LicenseOutput {
  @Expose()
  @ApiProperty()
  tx: string;

  @Expose()
  @ApiProperty()
  ipId: string;
}
