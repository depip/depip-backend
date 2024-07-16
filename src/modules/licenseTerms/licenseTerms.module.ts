import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import {LicenseTermsService } from './licenseTerms.service';
import { LicenseTermController } from './licenseTerms.controller';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'LicenseTerm',
    }),
  ],
  providers: [LicenseTermsService],
  controllers: [LicenseTermController],
})
export class LicenseTermsModule {}
