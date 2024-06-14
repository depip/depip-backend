import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { sha256 } from 'js-sha256';
import { InjectSchedule, Schedule } from 'nest-schedule';
import {
  CONST_MSG_TYPE,
  NODE_API,
  QUEUES,
} from '../common/constants/app.constant';
import { BlockSync } from '../entities';
import { SyncDataHelpers } from '../helpers/sync-data.helpers';
import { BlockSyncRepository } from '../repositories/block-sync.repository';
import { ENV_CONFIG } from '../shared/services/config.service';
import { CommonUtil } from '../utils/common.util';
import { InjectQueue } from '@nestjs/bull';
import { BackoffOptions, JobOptions, Queue } from 'bull';
import { SyncStatusRepository } from '../repositories/sync-status.repository';
import { getLastestBlockNumber } from '../web3';

@Injectable()
export class SyncTaskService {
  private readonly _logger = new Logger(SyncTaskService.name);
  private rpc;
  private api;
  private threads = 0;
  private schedulesSync: Array<number> = [];

  isCompleteWrite = false;

  constructor(
    private _commonUtil: CommonUtil,
    private blockSyncRepository: BlockSyncRepository,
    private statusRepository: SyncStatusRepository,
    @InjectSchedule() private readonly schedule: Schedule,
    @InjectQueue('smart-contracts') private readonly contractQueue: Queue,
  ) {
    this._logger.log(
      '============== Constructor Sync Task Service ==============',
    );

    this.rpc = ENV_CONFIG.NODE.RPC;
    this.api = ENV_CONFIG.NODE.API;

    this.threads = ENV_CONFIG.THREADS;
  }

  /**
   * Get latest block to insert Block Sync Error table
   */
  @Interval(ENV_CONFIG.TIMES_SYNC)
  async cronSync() {
    // Get the highest block and insert into SyncBlock
    const blocks = [];
    try {
      const [lastBlock, currentBlock] = await Promise.all([
        this.blockSyncRepository.max('lastBlock'),
        getLastestBlockNumber(),
      ]);
      this._logger.log(`currentBlock: ` + currentBlock);
      var toBlock = Number(currentBlock)
      var fromBlock = Number(currentBlock) - 100    
      
      fromBlock = lastBlock
      toBlock = fromBlock + 100
      
      if (toBlock > currentBlock) {
          toBlock = Number(currentBlock)
      }      

      if (currentBlock > lastBlock) {
        const blockSync = new BlockSync();
        blockSync.id = "IPAsset";
        blockSync.lastBlock = toBlock;
        blocks.push(blockSync);
      }
      if (blocks.length > 0) {
        this._logger.log(`Insert data to database`);
        await this.blockSyncRepository.insertOnDuplicate(blocks, [
          'id',
        ]);
      }
    } catch (error) {
      this._logger.log(
        `error when generate base blocks:${fromBlock}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Procces block insert data to db
   */
  // @Interval(3000)
  // async processBlock() {
  //   // Get the highest block and insert into SyncBlockError
  //   try {
  //     const results = await this.blockSyncRepository.find({
  //       order: {
  //         height: 'asc',
  //       },
  //       take: this.threads,
  //     });
  //     results.forEach((el) => {
  //       try {
  //         this.schedule.scheduleTimeoutJob(
  //           el.height.toString(),
  //           100,
  //           async () => {
  //             try {
  //               await this.handleSyncData(el.height, true);
  //             } catch (error) {
  //               this._logger.log('Error when process blocks height', el.height);
  //               return true;
  //             }
  //             return true;
  //           },
  //           {
  //             maxRetry: -1,
  //           },
  //         );
  //       } catch (error) {
  //         this.schedule.cancelJob(el?.height?.toString());
  //         this._logger.log('Catch duplicate height ', error.stack);
  //       }
  //     });
  //   } catch (error) {
  //     this._logger.log('error when process blocks', error.stack);
  //     throw error;
  //   }
  // }

  async handleSyncData(syncBlock: number, recallSync = false): Promise<any> {
    this._logger.log(
      null,
      `Class ${SyncTaskService.name}, call handleSyncData method with prameters: {syncBlock: ${syncBlock}}`,
    );

    try {
      // fetching block from node
      const paramsBlock = `block?height=${syncBlock}`;
      const blockData = await this._commonUtil.getDataRPC(
        this.rpc,
        paramsBlock,
      );

      //Insert block error table
      // if (!recallSync) {
      //   await this.insertBlockError(syncBlock);

      //   // Mark schedule is running
      //   this.schedulesSync.push(syncBlock);
      // }

      if (blockData.block.data.txs && blockData.block.data.txs.length > 0) {
        const listTransactions = [];
        let txDatas = [];
        const txs = [];
        for (const key in blockData.block.data.txs) {
          const element = blockData.block.data.txs[key];
          const txHash = sha256(Buffer.from(element, 'base64')).toUpperCase();
          const paramsTx = `cosmos/tx/v1beta1/txs/${txHash}`;
          txs.push(this._commonUtil.getDataAPI(this.api, paramsTx));
        }

        txDatas = await Promise.all(txs);
        // create transaction
        const txLength = blockData.block.data.txs?.length || 0;
        for (let i = 0; i < txLength; i++) {
          const txData = txDatas[i];
          const [txType] = SyncDataHelpers.makeTxRawLogData(txData);

          // Check to push into list transaction
          const txTypeCheck = txType.substring(txType.lastIndexOf('.') + 1);
          if (
            txData.tx_response.code === 0 &&
            (<any>Object).values(CONST_MSG_TYPE).includes(txTypeCheck)
          ) {
            listTransactions.push(txData);
          }
        }
      }

      // Update current block
      await this.updateStatus(syncBlock);

      const idxSync = this.schedulesSync.indexOf(syncBlock);
      if (idxSync > -1) {
        this.schedulesSync.splice(idxSync, 1);
      }
    } catch (error) {
      this._logger.error(
        null,
        `Sync Blocked & Transaction were error height: ${syncBlock}, ${error.name}: ${error.message}`,
      );
      this._logger.error(null, `${error.stack}`);

      const idxSync = this.schedulesSync.indexOf(syncBlock);
      if (idxSync > -1) {
        this.schedulesSync.splice(idxSync, 1);
      }
      throw new Error(error);
    }
  }

  /**
   * Upate current height of block
   * @param newLastBlock
   */
  async updateStatus(newLastBlock) {
    const status = await this.statusRepository.findOne();
    if (newLastBlock > status.current_block) {
      status.current_block = newLastBlock;
      await this.statusRepository.create(status);
    }
  }
}
