import { Injectable, Logger } from '@nestjs/common';
import { ENV_CONFIG } from '../shared/services/config.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class SyncDisputeService {
  private readonly _logger = new Logger(SyncDisputeService.name);

  constructor(@InjectQueue(ENV_CONFIG.STORY_PROTOCOL_SYNC.DISPUTE_SYNC) private disputeQueue: Queue) {
    this._logger.log('============== Constructor Dispute Sync Task Service ==============');
    this.disputeQueue.add(
      'syncDispute',
      {},
      {
        removeOnComplete: true,
        repeat: {
          every: ENV_CONFIG.TIME_SYNC_DISPUTE,
        },
      }
    );
  }
}
