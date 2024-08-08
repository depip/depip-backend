import { Module } from '@nestjs/common';
import {LicenseService } from './license.service';
import { BullModule } from '@nestjs/bull';
import { IpassetService } from '../ipasset/ipasset.service';
import { LicenseController } from './license.controller';
import { SmartAccountService } from '../particleAccounts/smartAccount.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'License',
    }),
  ],  
  providers: [LicenseService, IpassetService, SmartAccountService],
  controllers: [LicenseController],
})
export class LicenseModule {}
