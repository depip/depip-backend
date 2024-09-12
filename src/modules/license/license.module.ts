import { Module } from '@nestjs/common';
import { LicenseService } from './license.service';
import { BullModule } from '@nestjs/bull';
import { IpassetService } from '../ipasset/ipasset.service';
import { LicenseController } from './license.controller';
import { SmartAccountService } from '../particleAccounts/smartAccount.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IPAassets } from 'src/entities';
import { IPAassetsRepository } from 'src/repositories/ipasset.repository';

export const repositories = [IPAassetsRepository];
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'License',
    }),
    TypeOrmModule.forFeature([IPAassets]),
  ],
  providers: [LicenseService, IpassetService, SmartAccountService, ...repositories],
  controllers: [LicenseController],
})
export class LicenseModule {}
