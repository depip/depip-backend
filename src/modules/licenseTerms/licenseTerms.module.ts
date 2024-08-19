import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import {LicenseTermsService } from './licenseTerms.service';
import { LicenseTermController } from './licenseTerms.controller';
import { SmartAccountService } from '../particleAccounts/smartAccount.service';
import { SPGService } from '../spg/spg.service';
import { IPFSService } from '../files/ipfs.service';
import { IpassetService } from '../ipasset/ipasset.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'LicenseTerm',
    }),
  ],
  providers: [LicenseTermsService, SmartAccountService, SPGService, IPFSService, IpassetService],
  controllers: [LicenseTermController],
})
export class LicenseTermsModule {}
