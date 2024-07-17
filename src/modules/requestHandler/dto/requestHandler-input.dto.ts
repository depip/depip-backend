import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { PIL_TYPE } from '../../../shared/types/license-type';

export class RequestHandlerInput {
  @Expose()
  @ApiProperty()
  requestType: REQUEST_TYPE;

  @Expose()
  @ApiProperty()
  ipasset: Ipasset;  

  @Expose()
  @ApiProperty()
  pilTerm: PILTerm;   

  @Expose()
  @ApiProperty()
  license: License;     
}

export type PILTerm = {
  licensorIpId: string;
  pilType: PIL_TYPE;
  mintingFee: number;
  currency: string;
  termId: number;
};

export type Ipasset = {
  nftAddress: string;
  tokenId: string;
};

export type License = {
  licensorIpId: string;
  licenseTermsId: string;
  receiver: string;
  amount: number;
};

export enum REQUEST_TYPE {
  REGISTER_IPASSET,
  REGISTER_PIL_TERM,
  ATTACH_PIL_TERM,
  MINT_LICENSE_TOKEN,
}