import { ApiProperty } from '@nestjs/swagger';
import { IpAssetStatus } from '../../../entities';
export class GetIpassetInput {
  @ApiProperty()
  owner: string;
  @ApiProperty()
  chainId: string;
  @ApiProperty()
  pageLimit: string;
  @ApiProperty()
  pageOffset: string;

  @ApiProperty({
    required: false,
    default: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  order: string = 'DESC';

  @ApiProperty({
    required: false,
    enum: IpAssetStatus,
  })
  status: string;
}
