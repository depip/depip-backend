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
import { LicenseTermsService } from './licenseTerms.service';
import { licenseTermsInput } from './dto/licenseTerms-input.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { PIL_TYPE } from '../../shared/types/license-type';

@Controller('licenceseTerms')
@ApiTags('licenceseTerms')
export class LicenseTermController {
  constructor(private readonly licenseTermSvc: LicenseTermsService) { }

  @Post("register")
  // @UseInterceptors(CacheInterceptor)
  register(@Body() data: licenseTermsInput) {
    return this.licenseTermSvc.registerLicenseTerms(data.ipId, data.type, data.mintingFee, data.currency);
  }
}
