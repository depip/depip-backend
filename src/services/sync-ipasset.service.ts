import { Injectable, Logger } from '@nestjs/common';
import { IPAassets } from '../entities';
import { IPAassetsRepository } from '../repositories/ipasset.repository';
import { ENV_CONFIG } from '../shared/services/config.service';
import { Contract } from '../web3';
import IPAssetRegistryABI from '../web3/ABI/IPAssetRegistry.json';
import { AbiItem } from 'web3-utils';
import { CommonService } from './common.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class SyncIPAssetService {
  private readonly _logger = new Logger(SyncIPAssetService.name);
  constructor(@InjectQueue(ENV_CONFIG.STORY_PROTOCOL_SYNC.IPASSET_SYNC) private ipassetQueue: Queue) {
    this._logger.log('============== Constructor Sync Task Service ==============');
    this.ipassetQueue.add(
      'syncIpAsset',
      {},
      {
        removeOnComplete: true,
        repeat: {
          every: ENV_CONFIG.TIME_SYNC_IPASSET,
        },
      }
    );
  }
}
