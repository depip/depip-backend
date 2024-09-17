import { Injectable, Logger } from '@nestjs/common';
import { ENV_CONFIG } from '../shared/services/config.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { DerivativeRepository } from 'src/repositories/derivative.repository';
import { CommonService } from './common.service';

@Injectable()
export class SyncDerivativeService {
  private readonly _logger = new Logger(SyncDerivativeService.name);
  isCompleteWrite = false;

  constructor(
    private derivativeRepository: DerivativeRepository,
    @InjectQueue(ENV_CONFIG.STORY_PROTOCOL_SYNC.DERIVATIVE_SYNC) private derivativeQueue: Queue,
    private commonService: CommonService
  ) {
    this._logger.log('============== Constructor Derivative Sync Task Service ==============');
    this.derivativeQueue.add(
      'syncDerivative',
      {},
      {
        removeOnComplete: true,
        repeat: {
          every: ENV_CONFIG.TIME_SYNC_DERIVATIVE,
        },
      }
    );
  }
}
