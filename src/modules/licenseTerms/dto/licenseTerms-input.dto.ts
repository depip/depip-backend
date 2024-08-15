import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { PIL_TYPE } from '../../../shared/types/license-type';

export class licenseTermsInput {
  @Expose()
  @ApiProperty()
  ipId: string;

  @Expose()
  @ApiProperty()
  type: PIL_TYPE;

  @Expose()
  @ApiProperty()
  mintingFee: number;

  @Expose()
  @ApiProperty()
  termId: number;

  @Expose()
  @ApiProperty()
  currency: string;

  @Expose()
  @ApiProperty()
  session: any;    

  @Expose()
  @ApiProperty()
  userWallet: string;  
}
