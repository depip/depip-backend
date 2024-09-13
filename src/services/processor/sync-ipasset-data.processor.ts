import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { ENV_CONFIG } from '../../shared/services/config.service';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { Contract } from '../../web3';
import NftABI from '../../web3/ABI/NFT.json';
import { AbiItem } from 'web3-utils';
import { IPAssetData } from '../../entities';
import * as util from 'util';
import { IPAssetDataRepository } from '../../repositories/ipasset-data.repository';
import { CommonService } from '../common.service';
@Processor({ name: ENV_CONFIG.IPASSET_DATA_SYNC })
export class SyncIpassetDataProcessor {
  private readonly _logger = new Logger(SyncIpassetDataProcessor.name);
  constructor(
    @InjectQueue(ENV_CONFIG.IPASSET_DATA_SYNC) private ipassetDataQueue: Queue,
    private ipAssetDataRepository: IPAssetDataRepository,
    private commonService: CommonService
  ) {}

  @Process({ name: 'createIpAssetData', concurrency: ENV_CONFIG.PROCESSOR.IPASSET_DATA.CREATEIPASSETDATA.CONCURRENCY })
  async SyncIPAssetDataService(
    job: Job<{
      contractAddress: string;
      ipAssetId: number;
      ipId: string;
      tokenId: string;
      chainId: string;
    }>
  ) {
    this._logger.log(`Create IP asset data contract ${job.data.contractAddress}, tokenId ${job.data.tokenId}`);
    const nftContract = Contract(job.data.contractAddress, NftABI as AbiItem[]);
    const owner = await nftContract.methods.ownerOf(job.data.tokenId).call();
    if (typeof owner !== 'string') {
      throw Error('Owner is not string');
    }
    const ipAssetData = new IPAssetData();
    ipAssetData.ipasset_id = job.data.ipAssetId;
    ipAssetData.chain_id = job.data.chainId;
    ipAssetData.contract_address = job.data.contractAddress;
    ipAssetData.token_id = job.data.tokenId;
    ipAssetData.ip_id = job.data.ipId;
    ipAssetData.owner = owner;
    ipAssetData.metadata_onchain = {};
    ipAssetData.metadata_offchain = {};
    await this.ipAssetDataRepository.create(ipAssetData);
    await this.ipassetDataQueue.add(
      'getMetadata',
      {
        contractAddress: ipAssetData.contract_address,
        tokenId: ipAssetData.token_id,
        ipAssetDataId: ipAssetData.id,
        chainId: ipAssetData.chain_id,
      },
      {
        removeOnComplete: true,
        attempts: 3,
        backoff: 10000,
      }
    );
  }

  @Process({ name: 'getMetadata', concurrency: ENV_CONFIG.PROCESSOR.IPASSET_DATA.GETMETADATA.CONCURRENCY })
  async getMedataNFT(job: Job<{ contractAddress: string; tokenId: string; chainId: string; ipAssetDataId: number }>) {
    this._logger.log(`Update metadata IP asset data contract ${job.data.contractAddress}, tokenId ${job.data.tokenId}`);
    const horoscopeChainDB = this.commonService.getChainIdHoroscope(job.data.chainId);
    const query = {
      query: util.format(
        `query query($contract: String = "", $tokenId: String = "") {
        %s {
          erc721_token(where: {erc721_contract_address: {_eq: $contract}, token_id: {_eq: $tokenId}}) {
            media_info
          }
        }
      }`,
        horoscopeChainDB
      ),
      variables: { contract: job.data.contractAddress.toLowerCase(), tokenId: job.data.tokenId },
      operationName: 'query',
    };
    const response = await this.commonService.fetchDataHoroscope(query);
    if (response.data[horoscopeChainDB].erc721_token.length > 0) {
      const ipAssetDataDB = await this.ipAssetDataRepository.findOne(job.data.ipAssetDataId);
      if (ipAssetDataDB) {
        ipAssetDataDB.metadata_onchain = response.data[horoscopeChainDB].erc721_token[0].media_info?.onchain;
        ipAssetDataDB.metadata_offchain = response.data[horoscopeChainDB].erc721_token[0].media_info?.offchain;
        await this.ipAssetDataRepository.update(ipAssetDataDB);
      }
    } else {
      throw Error(
        `Metadata not found with token ${job.data.tokenId} on contract ${job.data.contractAddress.toLowerCase()}`
      );
    }
  }
}
