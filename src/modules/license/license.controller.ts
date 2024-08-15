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
import { LicenseService } from './license.service';
import { LicenseInput } from './dto/license-input.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('license')
@ApiTags('license')
export class LicenseController {
  constructor(private readonly licenseSvc: LicenseService) { }

  @Post("mintLicense")
  // @UseInterceptors(CacheInterceptor)
  mintLicense(@Body() data: LicenseInput) {
    return this.licenseSvc.mintLicenses(data.licensorIpId, data.licenseTermsId, data.receiver, data.amount, data.session, data.userWallet);
  }
}
