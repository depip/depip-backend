import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { ENV_CONFIG } from '../../shared/services/config.service';
import { Inject, Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { Contract } from '../../web3';
import { IPAssetsRepository } from '../../repositories/ipasset.repository';
import { CommonService } from '../common.service';
import IPAssetRegistryABI from '../../web3/ABI/IPAssetRegistry.json';
import { AbiItem } from 'web3-utils';
import { IPAssets } from '../../entities';
@Processor({ name: ENV_CONFIG.STORY_PROTOCOL_SYNC.IPASSET_SYNC })
export class SyncIpassetProcessor {
  private readonly _logger = new Logger(SyncIpassetProcessor.name);
  constructor(
    private ipassetsRepository: IPAssetsRepository,
    private commonService: CommonService,
    @InjectQueue(ENV_CONFIG.IPASSET_DATA_SYNC) private ipassetDataQueue: Queue
  ) {}

  @Process({ name: 'syncIpAsset', concurrency: 1 })
  async SyncIPAssetService(job: Job<unknown>) {
    try {
      const { fromBlock, toBlock, isExcute } = await this.commonService.getBlocks(
        ENV_CONFIG.STORY_PROTOCOL_SYNC.IPASSET_SYNC
      );
      var fBlock = fromBlock;
      if (isExcute) {
        await this.processBlock(fromBlock, toBlock);
        await this.commonService.updateStatus(toBlock + 1, ENV_CONFIG.STORY_PROTOCOL_SYNC.IPASSET_SYNC);
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
    const ipassetContract = Contract(ENV_CONFIG.STORY_PROTOCOL_CONTRACT.IPASSET, IPAssetRegistryABI as AbiItem[]);
    this._logger.log(`Sync IP asset from block ${fromBlock} to block ${toBlock}`);
    var newIPassets: any = await ipassetContract.getPastEvents('IPRegistered', {
      fromBlock: fromBlock,
      toBlock: toBlock,
    });
    const ipassets = newIPassets.map((newIPasset) => {
      const ipasset = new IPAssets();
      ipasset.contract_address = newIPasset.returnValues.tokenContract;
      ipasset.token_id = newIPasset.returnValues.tokenId;
      ipasset.chain_id = newIPasset.returnValues.chainId;
      ipasset.ip_id = newIPasset.returnValues.ipId;
      ipasset.name = newIPasset.returnValues.name;
      ipasset.uri = newIPasset.returnValues.uri;
      ipasset.registration_date = newIPasset.returnValues.registrationDate;
      return ipasset;
    });

    if (ipassets.length > 0) {
      this._logger.log(`Insert data to database`);
      await this.ipassetsRepository.insert(ipassets);

      await this.ipassetDataQueue.addBulk(
        ipassets.map((ipasset) => {
          return {
            name: 'createIpAssetData',
            data: {
              ipAssetId: ipasset.id,
              contractAddress: ipasset.contract_address,
              tokenId: ipasset.token_id.toString(),
              ipId: ipasset.ip_id,
              chainId: ipasset.chain_id.toString(),
            },
            options: {
              removeOnComplete: true,
              removeOnFail: false,
              attempts: 3,
              backoff: 10000,
            },
          };
        })
      );
    }
  }
}
