import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { ENV_CONFIG } from '../shared/services/config.service';
import { Contract } from '../web3';
import { AbiItem } from 'web3-utils'
import { DisputeABI } from 'src/web3/ABI/Dispute';
import { DisputeRaise } from 'src/entities/dispute-raise.entity';
import { DisputeRaiseRepository } from 'src/repositories/dispute-raise.repository';
import { DisputeCancelled } from 'src/entities/dispute-cancelled.entity';
import { DisputeCancelledRepository } from 'src/repositories/dispute-cancelled.repository';
import { CommonService } from './common.service';

@Injectable()
export class SyncDisputeService {
  private readonly _logger = new Logger(SyncDisputeService.name);
  private rpc;
  private api;
  private threads = 0;
  private schedulesSync: Array<number> = [];

  isCompleteWrite = false;

  constructor(
    private disputeRaiseRepository: DisputeRaiseRepository,
    private disputeCancelledRepository: DisputeCancelledRepository,
    private commonService: CommonService
    // @InjectSchedule() private readonly schedule: Schedule,
    // @InjectQueue('smart-contracts') private readonly contractQueue: Queue,
  ) {
    this._logger.log(
      '============== Constructor Dispute Sync Task Service ==============',
    );

    this.rpc = ENV_CONFIG.NODE.RPC;
    this.api = ENV_CONFIG.NODE.API;

    this.threads = ENV_CONFIG.THREADS;
  }

  /**
   * Get latest block to insert Block Sync table
   */
  @Interval(ENV_CONFIG.TIMES_SYNC)
  async cronSync() {
    // Get the highest block and insert into SyncBlock
    try {
      const { fromBlock, toBlock, isExcute } = await this.commonService.getBlocks(ENV_CONFIG.TOKENLICENSE_SYNC)
      var fBlock = fromBlock;
      if (isExcute) {
        await this.processBlock(fromBlock, toBlock);
        this.commonService.updateStatus(toBlock, ENV_CONFIG.DISPUTE_SYNC);        
      }

    } catch (error) {
      this._logger.log(
        `error when generate base blocks:${fBlock}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Process block
   * @param newLastBlock
   */
  async processBlock(fromBlock, toBlock) {
    const disputeContract = Contract(
      ENV_CONFIG.STORY_PROTOCOL_CONTRACT.DISTUPE,
      DisputeABI as AbiItem[]
    );

    this._logger.log(`[DISPUTE] fromBlock: ` + fromBlock);
    this._logger.log(`[DISPUTE] toBlock: ` + toBlock);
    var newDisputes: any = await disputeContract.getPastEvents('DisputeRaised', {fromBlock:fromBlock, toBlock: toBlock})
    const disputes = [];
    await Promise.all(newDisputes.map(newDispute => new Promise(async (resolve, reject) => {
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
        resolve(disputes)
      }
      catch (ex) {
          console.error(ex)
          reject(null)
      }
    }))) 

    if (disputes.length > 0) {
      this._logger.log(`Insert Dispute Raise data to database`);
      await this.disputeRaiseRepository.upsert(disputes, [
        'id',
      ]);
    }    
    var newDisputesCancelled: any = await disputeContract.getPastEvents('DisputeCancelled', {fromBlock:fromBlock, toBlock: toBlock})
    const disputesCancelled = [];
    await Promise.all(newDisputesCancelled.map(newDisputeCancelled => new Promise(async (resolve, reject) => {
      try {
        const disputeCancelled = new DisputeCancelled();
        disputeCancelled.disputeId = newDisputeCancelled?.returnValues?.disputeId;
        disputeCancelled.data = newDisputeCancelled?.returnValues?.data;
        disputeCancelled.signature = newDisputeCancelled?.signature;
        disputesCancelled.push(disputeCancelled);
        resolve(disputesCancelled)
      }
      catch (ex) {
          console.error(ex)
          reject(null)
      }
    }))) 

    if (disputesCancelled.length > 0) {
      this._logger.log(`Insert Dispute Cancelled data to database`);
      await this.disputeCancelledRepository.upsert(disputesCancelled, [
        'id',
      ]);
    }  
  }  
}
