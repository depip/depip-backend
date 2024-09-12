import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IpassetService } from './ipasset.service';
import { IpassetInput } from './dto/ipasset-input.dto';

@Controller('ipasset')
@ApiTags('ipasset')
export class IpassetController {
  constructor(private readonly ipassetSvc: IpassetService) {}

  @Post('register')
  // @UseInterceptors(CacheInterceptor)
  ipassetRegister(@Body() data: IpassetInput) {
    return this.ipassetSvc.registerIpasset(data.nftAddress, data.tokenId, data.session, data.userWallet);
    // return this.ipassetSvc.registerIpassetOld(data.nftAddress, data.tokenId);
  }

  @Get()
  getIpAsset(
    @Query('owner') owner: string,
    @Query('chainId') chainId: string,
    @Query('pageLimit') pageLimit: string,
    @Query('pageOffset') pageOffset: string
  ) {
    return this.ipassetSvc.getIpAsset(owner, chainId, Number(pageLimit), Number(pageOffset));
  }
}
