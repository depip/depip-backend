import { Module } from '@nestjs/common';
import { IpassetService } from './ipasset.service';
import { BullModule } from '@nestjs/bull';
import { IpassetController } from './ipasset.controller';
import { SmartAccountService } from '../particleAccounts/smartAccount.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'Ipasset',
    }),
  ],
  providers: [IpassetService, SmartAccountService],
  controllers: [IpassetController],
})
export class IpassetModule {}
