import { Injectable, Logger } from '@nestjs/common';
import { BlockSync } from '../entities';
import { BlockSyncRepository } from '../repositories/block-sync.repository';
import { from } from 'rxjs';
import { getLastestBlockNumber } from 'src/web3';

@Injectable()
export class CommonService {
  private readonly _logger = new Logger(CommonService.name);

  isCompleteWrite = false;

  constructor(
    private blockSyncRepository: BlockSyncRepository,
  ) {
    this._logger.log(
      '============== Constructor Common Service ==============',
    );
  }

  /**
   * Upate current height of block
   * @param newLastBlock
   */
  async updateStatus(newLastBlock, id) {
    const lastBlock = await this.blockSyncRepository.findOne({ contract: id });
    if (!lastBlock) {
      const blockSync = new BlockSync();
      blockSync.contract = id;
      blockSync.last_block = newLastBlock;
      await this.blockSyncRepository.create(blockSync);
    } else {
      lastBlock.last_block = newLastBlock;
      await this.blockSyncRepository.create(lastBlock);
    }
  }

  async getBlocks(contract) {
    const [lastBlock, currentBlock] = await Promise.all([
      (await this.blockSyncRepository.findOne({ contract: contract })).last_block || 0,
      getLastestBlockNumber(),
    ]);

    var toBlock = Number(currentBlock)
    var fromBlock = Number(currentBlock) - 100

    fromBlock = lastBlock || fromBlock
    // fromBlock = 6170889
    toBlock = fromBlock + 100

    if (toBlock > currentBlock) {
      toBlock = Number(currentBlock)
    }
    var isExcute = currentBlock > fromBlock;
    return { fromBlock, toBlock, isExcute }
  }
}
