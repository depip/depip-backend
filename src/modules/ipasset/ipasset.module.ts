import { Module } from '@nestjs/common';
import { IpassetService } from './ipasset.service';
import { BullModule } from '@nestjs/bull';
import { IpassetController } from './ipasset.controller';
import { SmartAccountService } from '../particleAccounts/smartAccount.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IPFSService } from '../files/ipfs.service';
import { IPAassetsRepository } from '../../repositories/ipasset.repository';
import { IPAassets } from '../../entities';

export const repositories = [IPAassetsRepository];

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'Ipasset',
    }),
    TypeOrmModule.forFeature([IPAassets]),
  ],
  providers: [IpassetService, SmartAccountService, IPFSService, ...repositories],
  controllers: [IpassetController],
  exports: [IpassetService, TypeOrmModule],
})
export class IpassetModule {}
