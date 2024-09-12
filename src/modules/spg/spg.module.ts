import { Module } from '@nestjs/common';
import { SPGService } from './spg.service';
import { SpgController } from './spg.controller';
import { BullModule } from '@nestjs/bull';
import { IPFSService } from '../files/ipfs.service';
import { IpassetService } from '../ipasset/ipasset.service';
import { SmartAccountService } from '../particleAccounts/smartAccount.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IPAassets } from 'src/entities';
import { IPAassetsRepository } from 'src/repositories/ipasset.repository';

export const repositories = [IPAassetsRepository];
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'SPG',
    }),
    TypeOrmModule.forFeature([IPAassets]),
  ],
  providers: [SPGService, IPFSService, IpassetService, SmartAccountService, ...repositories],
  controllers: [SpgController],
})
export class SpgModule {}
