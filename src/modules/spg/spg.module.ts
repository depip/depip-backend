import { Module } from '@nestjs/common';
import { SPGService } from './spg.service';
import { SpgController } from './spg.controller';
import { BullModule } from '@nestjs/bull';
import { IPFSService } from '../files/ipfs.service';
import { IpassetService } from '../ipasset/ipasset.service';
import { SmartAccountService } from '../particleAccounts/smartAccount.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IPAssets } from 'src/entities';
import { IPAssetsRepository } from 'src/repositories/ipasset.repository';

export const repositories = [IPAssetsRepository];
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'SPG',
    }),
    TypeOrmModule.forFeature([IPAssets]),
  ],
  providers: [SPGService, IPFSService, IpassetService, SmartAccountService, ...repositories],
  controllers: [SpgController],
})
export class SpgModule {}
