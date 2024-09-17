import { Process, Processor } from '@nestjs/bull';
import { ENV_CONFIG } from '../../shared/services/config.service';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { Contract } from '../../web3';
import { CommonService } from '../common.service';
import { AbiItem } from 'web3-utils';
import { DerivativeRepository } from 'src/repositories';
import { DerivativeABI } from 'src/web3/ABI/Derivative';
import { Derivative } from 'src/entities/derivative.entity';
@Processor({ name: ENV_CONFIG.STORY_PROTOCOL_SYNC.DERIVATIVE_SYNC })
export class SyncDerivativeProcessor {
  private readonly _logger = new Logger(SyncDerivativeProcessor.name);
  constructor(private derivativeRepository: DerivativeRepository, private commonService: CommonService) {}

  @Process({ name: 'syncDerivative', concurrency: 1 })
  async SyncDerivativeService(job: Job<unknown>) {
    try {
      const { fromBlock, toBlock, isExcute } = await this.commonService.getBlocks(
        ENV_CONFIG.STORY_PROTOCOL_SYNC.DERIVATIVE_SYNC
      );
      var fBlock = fromBlock;
      if (isExcute) {
        await this.processBlock(fromBlock, toBlock);
        await this.commonService.updateStatus(toBlock + 1, ENV_CONFIG.STORY_PROTOCOL_SYNC.DERIVATIVE_SYNC);
      }
    } catch (error) {
      this._logger.error(`error when generate base blocks:${fBlock}`, error.stack);
      throw error;
    }
  }
  /**
   * Process block
   * @param newLastBlock
   */
  async processBlock(fromBlock, toBlock) {
    const derivativeContract = Contract(ENV_CONFIG.STORY_PROTOCOL_CONTRACT.DERIVATIVE, DerivativeABI as AbiItem[]);
    this._logger.log(`Sync derivative from block ${fromBlock} to block ${toBlock}`);
    var newDerivatives: any = await derivativeContract.getPastEvents('DerivativeRegistered', {
      fromBlock: fromBlock,
      toBlock: toBlock,
    });
    const derivatives = [];
    await Promise.all(
      newDerivatives.map(
        (newDerivative) =>
          new Promise(async (resolve, reject) => {
            try {
              // console.log(newDerivative)
              const derivative = new Derivative();
              derivative.caller = newDerivative?.returnValues?.caller;
              derivative.childIpId = newDerivative?.returnValues?.childIpId;
              derivative.licenseTokenIds = newDerivative?.returnValues?.licenseTokenIds;
              derivative.parentIpIds = newDerivative?.returnValues?.parentIpIds;
              derivative.licenseTermsIds = newDerivative?.returnValues?.licenseTermsIds;
              derivative.licenseTemplate = newDerivative?.returnValues?.licenseTemplate;
              derivative.signature = newDerivative?.signature;
              derivatives.push(derivative);
              resolve(derivatives);
            } catch (ex) {
              console.error(ex);
              reject(null);
            }
          })
      )
    );

    if (derivatives.length > 0) {
      this._logger.log(`Insert Derivative data to database`);
      await this.derivativeRepository.upsert(derivatives, ['id']);
    }
  }
}
