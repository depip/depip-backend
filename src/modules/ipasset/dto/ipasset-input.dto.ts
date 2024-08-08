import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class IpassetInput {

  @Expose()
  @ApiProperty()
  userWallet: string;

  @Expose()
  @ApiProperty()
  nftAddress: string;

  @Expose()
  @ApiProperty()
  tokenId: string;

  @Expose()
  @ApiProperty()
  session: any;    
}
