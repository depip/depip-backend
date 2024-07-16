import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class LicenseInput {
  @Expose()
  @ApiProperty()
  nftAddress: string;

  @Expose()
  @ApiProperty()
  tokenId: string;
}
