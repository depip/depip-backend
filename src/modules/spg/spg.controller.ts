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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SPGService } from './spg.service';
import { spgInput } from './dto/spg-input.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('SPG')
@ApiTags('spg')
export class SpgController {
  constructor(private readonly spgSvc: SPGService) { }

  @Post("mintAndRegistryIp")
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  mintAndRegistryIp
  (
    @Body() data: spgInput,
    @UploadedFile() file: Express.Multer.File  
  ) {

    return this.spgSvc.mintAndRegistryIp(data.name, data.description, data.recipient, file);
  }
  
}
