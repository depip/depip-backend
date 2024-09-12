import { Injectable, Logger } from '@nestjs/common';
import { ENV_CONFIG } from '../shared/services/config.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class SyncLicenseService {
  private readonly _logger = new Logger(SyncLicenseService.name);
  constructor(@InjectQueue(ENV_CONFIG.STORY_PROTOCOL_SYNC.LICENSE_SYNC) private ipassetQueue: Queue) {
    this._logger.log('============== Constructor License Sync Task Service ==============');
    this.ipassetQueue.add(
      'syncLicense',
      {},
      {
        removeOnComplete: true,
        repeat: {
          every: ENV_CONFIG.TIME_SYNC_LICENSE,
        },
      }
    );
  }
}
