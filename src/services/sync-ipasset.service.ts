import { Injectable, Logger } from '@nestjs/common';
import { ENV_CONFIG } from '../shared/services/config.service';
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
