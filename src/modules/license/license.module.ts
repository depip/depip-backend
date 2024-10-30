import { Module } from '@nestjs/common';
import { LicenseService } from './license.service';
import { BullModule } from '@nestjs/bull';
import { IpassetService } from '../ipasset/ipasset.service';
import { LicenseController } from './license.controller';
import { SmartAccountService } from '../particleAccounts/smartAccount.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IPAssets } from 'src/entities';
import { IPAssetsRepository } from 'src/repositories/ipasset.repository';

export const repositories = [IPAssetsRepository];
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'License',
    }),
    TypeOrmModule.forFeature([IPAssets]),
  ],
  providers: [LicenseService, IpassetService, SmartAccountService, ...repositories],
  controllers: [LicenseController],
})
export class LicenseModule {}
