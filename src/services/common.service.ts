import { Injectable, Logger } from '@nestjs/common';
import { BlockSync } from '../entities';
import { BlockSyncRepository } from '../repositories/block-sync.repository';
import { firstValueFrom, from } from 'rxjs';
import { getLastestBlockNumber } from 'src/web3';
import { ENV_CONFIG } from '../shared/services/config.service';
import { HttpService } from '@nestjs/axios';
import { In } from 'typeorm';
@Injectable()
export class CommonService {
  private readonly _logger = new Logger(CommonService.name);

  isCompleteWrite = false;

  constructor(private blockSyncRepository: BlockSyncRepository, private httpService: HttpService) {
    this._logger.log('============== Constructor Common Service ==============');
  }

  /**
   * Upate current height of block
   * @param newLastBlock
   */
  async updateStatus(newLastBlock, id) {
    const lastBlock = await this.blockSyncRepository.findOne({ where: { contract: id } });
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

  async getBlocks(contract: string, jobsNeedRunAfter: string[] = []) {
    const [lastBlock, currentBlock] = await Promise.all([
      (await this.blockSyncRepository.findOne({ where: { contract: contract } })).last_block || 0,
      getLastestBlockNumber(),
    ]);
    var toBlock = Number(currentBlock);
    var fromBlock = Number(currentBlock) - 100;

    fromBlock = lastBlock || fromBlock;
    // fromBlock = 6170889
    toBlock = fromBlock + 100;

    if (toBlock > currentBlock) {
      toBlock = Number(currentBlock);
    }

    if (jobsNeedRunAfter.length > 0) {
      const jobsNeed = await this.blockSyncRepository.find({
        where: {
          contract: In(jobsNeedRunAfter),
        },
        order: {
          last_block: 'ASC',
        },
      });
      if (toBlock > jobsNeed[0].last_block - 1) {
        toBlock = jobsNeed[0].last_block - 1;
      }
    }

    var isExcute = fromBlock < currentBlock && fromBlock <= toBlock;
    return { fromBlock, toBlock, isExcute };
  }

  getChainIdHoroscope(chainId: string) {
    switch (chainId) {
      case '1513':
        return 'storytestnet';
      default:
        throw Error(`Cannot found chain ${chainId} from Horoscope`);
    }
  }

  async fetchDataHoroscope(query: any, endpoint?: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(ENV_CONFIG.HOROSCOPE.API, query, {
          timeout: ENV_CONFIG.HOROSCOPE.TIMEOUT,
        })
      );

      if (response.data?.errors?.length > 0) {
        this._logger.error(
          response.data.errors,
          `Error while querying from graphql! ${JSON.stringify(response.data.errors)}`
        );
        throw Error(response.data.errors);
      }

      return response.data;
    } catch (error) {
      this._logger.error(query, `Error while querying from graphql! ${error}`);
      throw Error(error);
    }
  }
}
