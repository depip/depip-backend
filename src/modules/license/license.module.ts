import { Module } from '@nestjs/common';
import {LicenseService } from './license.service';
import { BullModule } from '@nestjs/bull';
import { IpassetService } from '../ipasset/ipasset.service';
import { LicenseController } from './license.controller';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'License',
    }),
  ],  
  providers: [LicenseService, IpassetService],
  controllers: [LicenseController],
})
export class LicenseModule {}
