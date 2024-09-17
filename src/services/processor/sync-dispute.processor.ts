import { Process, Processor } from '@nestjs/bull';
import { ENV_CONFIG } from '../../shared/services/config.service';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { Contract } from '../../web3';
import { CommonService } from '../common.service';
import { AbiItem } from 'web3-utils';
import { DisputeCancelledRepository, DisputeRaiseRepository } from 'src/repositories';
import { DisputeCancelled } from 'src/entities/dispute-cancelled.entity';
import { DisputeABI } from 'src/web3/ABI/Dispute';
import { DisputeRaise } from 'src/entities/dispute-raise.entity';
@Processor({ name: ENV_CONFIG.STORY_PROTOCOL_SYNC.DISPUTE_SYNC })
export class SyncDisputeProcessor {
  private readonly _logger = new Logger(SyncDisputeProcessor.name);
  constructor(
    private disputeRaiseRepository: DisputeRaiseRepository,
    private disputeCancelledRepository: DisputeCancelledRepository,
    private commonService: CommonService
  ) {}

  @Process({ name: 'syncDispute', concurrency: 1 })
  async SyncDisputeService(job: Job<unknown>) {
    try {
      const { fromBlock, toBlock, isExcute } = await this.commonService.getBlocks(
        ENV_CONFIG.STORY_PROTOCOL_SYNC.DISPUTE_SYNC
      );
      var fBlock = fromBlock;
      if (isExcute) {
        await this.processBlock(fromBlock, toBlock);
        await this.commonService.updateStatus(toBlock + 1, ENV_CONFIG.STORY_PROTOCOL_SYNC.DISPUTE_SYNC);
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
    const disputeContract = Contract(ENV_CONFIG.STORY_PROTOCOL_CONTRACT.DISTUPE, DisputeABI as AbiItem[]);

    this._logger.log(`Sync dispute from block ${fromBlock} to block ${toBlock}`);
    var newDisputes: any = await disputeContract.getPastEvents('DisputeRaised', {
      fromBlock: fromBlock,
      toBlock: toBlock,
    });
    const disputes = [];
    await Promise.all(
      newDisputes.map(
        (newDispute) =>
          new Promise(async (resolve, reject) => {
            try {
              const dispute = new DisputeRaise();
              dispute.disputeId = newDispute?.returnValues?.disputeId;
              dispute.targetIpId = newDispute?.returnValues?.targetIpId;
              dispute.disputeInitiator = newDispute?.returnValues?.disputeInitiator;
              dispute.arbitrationPolicy = newDispute?.returnValues?.arbitrationPolicy;
              dispute.linkToDisputeEvidence = newDispute?.returnValues?.linkToDisputeEvidence;
              dispute.targetTag = newDispute?.returnValues?.targetTag;
              dispute.data = newDispute?.returnValues?.data;
              dispute.signature = newDispute?.signature;
              disputes.push(dispute);
              resolve(disputes);
            } catch (ex) {
              console.error(ex);
              reject(null);
            }
          })
      )
    );

    if (disputes.length > 0) {
      this._logger.log(`Insert Dispute Raise data to database`);
      await this.disputeRaiseRepository.upsert(disputes, ['id']);
    }
    var newDisputesCancelled: any = await disputeContract.getPastEvents('DisputeCancelled', {
      fromBlock: fromBlock,
      toBlock: toBlock,
    });
    const disputesCancelled = [];
    await Promise.all(
      newDisputesCancelled.map(
        (newDisputeCancelled) =>
          new Promise(async (resolve, reject) => {
            try {
              const disputeCancelled = new DisputeCancelled();
              disputeCancelled.disputeId = newDisputeCancelled?.returnValues?.disputeId;
              disputeCancelled.data = newDisputeCancelled?.returnValues?.data;
              disputeCancelled.signature = newDisputeCancelled?.signature;
              disputesCancelled.push(disputeCancelled);
              resolve(disputesCancelled);
            } catch (ex) {
              console.error(ex);
              reject(null);
            }
          })
      )
    );

    if (disputesCancelled.length > 0) {
      this._logger.log(`Insert Dispute Cancelled data to database`);
      await this.disputeCancelledRepository.upsert(disputesCancelled, ['id']);
    }
  }
}
