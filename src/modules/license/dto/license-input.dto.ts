import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class LicenseInput {
  @Expose()
  @ApiProperty()
  licensorIpId: string;

  @Expose()
  @ApiProperty()
  licenseTermsId: string;

  @Expose()
  @ApiProperty()
  receiver: string;
  
  @Expose()
  @ApiProperty()
  amount: number;  
}
