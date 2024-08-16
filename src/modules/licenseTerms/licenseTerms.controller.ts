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

@Controller('licenceseTerms')
@ApiTags('licenceseTerms')
export class LicenseTermController {
  constructor(private readonly licenseTermSvc: LicenseTermsService) { }

  @Post("registerPILTerms")
  // @UseInterceptors(CacheInterceptor)
  registerPILTerms(@Body() data: licenseTermsInput) {
    return this.licenseTermSvc.registerPILTerms(data.type, data.mintingFee, data.currency, data.session, data.commercialRevShare);
  }

  @Post("attackPILTerms")
  // @UseInterceptors(CacheInterceptor)
  attackPILTerms(@Body() data: licenseTermsInput) {
    return this.licenseTermSvc.attackPILTerms(data.ipId, data.termId, data.session, data.userWallet);
  }  
}
