import { Module } from '@nestjs/common';
import { SPGService } from './spg.service';
import { SpgController } from './spg.controller';
import { BullModule } from '@nestjs/bull';
import { IPFSService } from '../files/ipfs.service';
import { IpassetService } from '../ipasset/ipasset.service';
import { SmartAccountService } from '../particleAccounts/smartAccount.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'SPG',
    }),
  ],
  providers: [SPGService, IPFSService, IpassetService, SmartAccountService],
  controllers: [SpgController],
})
export class SpgModule {}
