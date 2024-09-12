import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { ENV_CONFIG } from '../../shared/services/config.service';
import { Inject, Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { Contract } from '../../web3';
import { IPAassetsRepository } from '../../repositories/ipasset.repository';
import { CommonService } from '../common.service';
import IPAssetRegistryABI from '../../web3/ABI/IPAssetRegistry.json';
import { AbiItem } from 'web3-utils';
import { IPAassets } from '../../entities';
@Processor({ name: ENV_CONFIG.IPASSET_SYNC })
export class SyncIpassetProcessor {
  private readonly _logger = new Logger(SyncIpassetProcessor.name);
  constructor(
    private ipaassetsRepository: IPAassetsRepository,
    private commonService: CommonService,
    @InjectQueue(ENV_CONFIG.IPASSET_DATA_SYNC) private ipassetDataQueue: Queue
  ) {}

  @Process({ name: 'syncIpAsset', concurrency: 1 })
  async SyncIPAssetService(job: Job<unknown>) {
    try {
      const { fromBlock, toBlock, isExcute } = await this.commonService.getBlocks(ENV_CONFIG.IPASSET_SYNC);
      var fBlock = fromBlock;
      if (isExcute) {
        await this.processBlock(fromBlock, toBlock);
        this.commonService.updateStatus(toBlock + 1, ENV_CONFIG.IPASSET_SYNC);
      }
    } catch (error) {
      this._logger.log(`error when generate base blocks:${fBlock}`, error.stack);
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
    const ipaassets = [];
    newIPassets.map((newIPasset) => {
      try {
        const ipaasset = new IPAassets();
        ipaasset.contract_address = newIPasset.returnValues.tokenContract;
        ipaasset.token_id = newIPasset.returnValues.tokenId;
        ipaasset.chain_id = newIPasset.returnValues.chainId;
        ipaasset.ip_id = newIPasset.returnValues.ipId;
        ipaasset.name = newIPasset.returnValues.name;
        ipaasset.uri = newIPasset.returnValues.uri;
        ipaasset.registration_date = newIPasset.returnValues.registrationDate;
        ipaassets.push(ipaasset);
      } catch (error) {
        this._logger.log(`error when generate base blocks:${fromBlock}`, error.stack);
        throw error;
      }
    });

    if (ipaassets.length > 0) {
      this._logger.log(`Insert data to database`);
      await this.ipaassetsRepository.insert(ipaassets);

      await this.ipassetDataQueue.addBulk(
        ipaassets.map((ipasset) => {
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
              attempts: 3,
              backoff: 10000,
            },
          };
        })
      );

      // ipaassets.forEach((ipasset) => {
      //   this.ipassetDataQueue.add(
      //     'createIpAssetData',
      //     {
      //       ipAssetId: ipasset.id,
      //       contractAddress: ipasset.contract_address,
      //       tokenId: ipasset.token_id.toString(),
      //       ipId: ipasset.ip_id,
      //       chainId: ipasset.chain_id.toString(),
      //     },
      //     {
      //       removeOnComplete: true,
      //       attempts: 3,
      //       backoff: 10000,
      //     }
      //   );
      // });
    }
  }
}
