import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { LicenseTermsService } from './licenseTerms.service';
import { LicenseTermController } from './licenseTerms.controller';
import { SmartAccountService } from '../particleAccounts/smartAccount.service';
import { SPGService } from '../spg/spg.service';
import { IPFSService } from '../files/ipfs.service';
import { IpassetService } from '../ipasset/ipasset.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IPAassets } from 'src/entities';
import { IPAassetsRepository } from 'src/repositories/ipasset.repository';

export const repositories = [IPAassetsRepository];
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'LicenseTerm',
    }),
    TypeOrmModule.forFeature([IPAassets]),
  ],

  providers: [LicenseTermsService, SmartAccountService, SPGService, IPFSService, IpassetService, ...repositories],
  controllers: [LicenseTermController],
})
export class LicenseTermsModule {}
