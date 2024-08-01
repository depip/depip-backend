import { Module } from '@nestjs/common';
import { SPGService } from './spg.service';
import { SpgController } from './spg.controller';
import { BullModule } from '@nestjs/bull';
import { IPFSService } from '../files/ipfs.service';
import { IpassetService } from '../ipasset/ipasset.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'SPG',
    }),
  ],
  providers: [SPGService, IPFSService, IpassetService],
  controllers: [SpgController],
})
export class SpgModule {}
