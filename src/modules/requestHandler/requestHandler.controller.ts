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
import { RequestHandlerService } from './requestHandler.service';
import { RequestHandlerInput } from './dto/requestHandler-input.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('requestHandler')
@ApiTags('requestHandler')
export class RequestHandlerController {
  constructor(private readonly requestHandlerSvc: RequestHandlerService) { }

  @Post("actionRequest")
  // @UseInterceptors(CacheInterceptor)
  actionRequest(@Body() data: RequestHandlerInput) {
    return this.requestHandlerSvc.requestHandle(data);
  }
}
