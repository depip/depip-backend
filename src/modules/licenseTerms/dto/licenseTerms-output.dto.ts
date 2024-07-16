import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class licenseTermsOutput {
  @Expose()
  @ApiProperty()
  tx: string;

  @Expose()
  @ApiProperty()
  ipId: string;
}
