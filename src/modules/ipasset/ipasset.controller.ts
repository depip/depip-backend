import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { IpassetService } from './ipasset.service';
import { ipassetInput } from './dto/ipasset-input.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('ipasset')
@ApiTags('ipasset')
export class IpassetController {
  constructor(private readonly ipassetSvc: IpassetService) { }

  @Post("register")
  // @UseInterceptors(CacheInterceptor)
  ipassetRegister(@Body() data: ipassetInput) {
    return this.ipassetSvc.registerIpasset(data.nftAddress, data.tokenId);
  }
}
