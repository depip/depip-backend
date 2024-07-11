import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { findLast } from 'lodash';
import { ENV_CONFIG } from '../../shared/services/config.service';
import { IpassetService } from '../ipasset/ipasset.service';
import { getLicenseTermByType } from '../../utils/getLicenseTermsByType';
import { PIL_TYPE } from '../../shared/types/license-type';
import {
  Contract,
  JsonRpcProvider,
  Wallet,
  formatEther,
  parseEther,
} from 'ethers';
import * as fs from 'fs';
import path from 'path';

@Injectable()
export class LicenseService {
  private readonly _logger = new Logger(LicenseService.name);
  private PROVIDER_URL = ENV_CONFIG.NODE.RPC;
  // Connecting to provider
  private PROVIDER = new JsonRpcProvider(this.PROVIDER_URL);
  private ipassetContractAddr: string = ENV_CONFIG.STORY_PROTOCOL_CONTRACT.IPASSET;
  private CONTRACT_ABI = [];
  private contractWithMasterWallet = null;
  private masterWallet = null;

  constructor(
    private ipassetService: IpassetService,

  ) {}  

  async mintLicenses(nftAddr: string, tokenId: number) {
    this._logger.log(`perform registration ipasset! `);

    // Connecting to smart contract
    if (!this.contractWithMasterWallet) {
      this.contractWithMasterWallet = await this._getContract();
      if (!this.contractWithMasterWallet) {
        const errMsg = `can not get contract With Master Wallet`;
        this._logger.error(errMsg);
        throw new Error(errMsg);
      }
    }

    // Check registed Ipasset
    let ipId = null
    ipId = await this._isRegistered(nftAddr, tokenId, ENV_CONFIG.NODE.CHAINID)
    if (!ipId) {
      const tx = await this.ipassetService.registerIpasset(nftAddr, tokenId)

      ipId = await this.contractWithMasterWallet.ipId(
        ENV_CONFIG.NODE.CHAINID,
        nftAddr,
        tokenId
      );      
    }

    // Check PIL Terms
    const licenseTermsId = await this._registerPILTerms("10", "0x0000000000000000000000000000000000000000", PIL_TYPE.COMMERCIAL_USE);
    // Register PIL terms

    // Attack PIL terms


    // Mint License  
    this._logger.log(`perform to call contract! `);
    const tx = await this.contractWithMasterWallet.register(
      ENV_CONFIG.NODE.CHAINID,
      nftAddr,
      tokenId
    );
    const res = await tx.wait();
    if (res.status !== 1) {
      alert('error message');
      return "Register fail: " + res.hash
    }else{
      return "Register successed, TX: " + res.hash
    }
  }

  async _getContract() {
    this.masterWallet = new Wallet(ENV_CONFIG.MASTERWALLET, new JsonRpcProvider(this.PROVIDER_URL));
    if (!this.masterWallet) return null;

    if (this.CONTRACT_ABI.length == 0) {
      const abiFilePath = path.resolve(__dirname, '../../web3/ABI/IPAssetRegistry.json');
      const files = fs.readFileSync(abiFilePath);
      this.CONTRACT_ABI = JSON.parse(files.toString());
    }

    // Connecting to smart contract
    const contract = new Contract(
      this.ipassetContractAddr,
      this.CONTRACT_ABI,
      this.PROVIDER
    );

    const rs = contract.connect(this.masterWallet);
    return rs;
  }

  async _attackPILTerms() {
    // const isExisted = await this.piLicenseTemplateReadOnlyClient.exists({
    //   licenseTermsId: request.licenseTermsId,
    // });

    // const isExisted = await this.piLicenseTemplateReadOnlyClient.exists({
    //   licenseTermsId: request.licenseTermsId,
    // });
    // if (!isExisted) {
    //   throw new Error(`License terms id ${request.licenseTermsId} do not exist.`);
    // }
    // const isAttachedLicenseTerms =
    //   await this.licenseRegistryReadOnlyClient.hasIpAttachedLicenseTerms({
    //     ipId: request.ipId,
    //     licenseTemplate:
    //       (request.licenseTemplate &&
    //         getAddress(request.licenseTemplate, "request.licenseTemplate")) ||
    //       this.licenseTemplateClient.address,
    //     licenseTermsId: request.licenseTermsId,
    //   });
    // if (isAttachedLicenseTerms) {
    //   return { txHash: "", success: false };
    // }
    // const txHash = await this.licensingModuleClient.attachLicenseTerms({
    //   ipId: request.ipId,
    //   licenseTemplate: request.licenseTemplate || this.licenseTemplateClient.address,
    //   licenseTermsId: request.licenseTermsId,
    // });
    // if (request.txOptions?.waitForTransaction) {
    //   await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
    //   return { txHash: txHash, success: true };
    // } else {
    //   return { txHash: txHash };
    // }
    return null;
  }    

  async _registerPILTerms(mintingFee, currency, pilType) {

    const licenseTerms = getLicenseTermByType(PIL_TYPE.COMMERCIAL_USE, {
      mintingFee: mintingFee,
      currency: currency,
      royaltyPolicyLAPAddress: ENV_CONFIG.STORY_PROTOCOL_CONTRACT.ROYALTY_POLICYLAP,
    });

    // PIL Term Existed
    // const licenseTermsId = await this.getLicenseTermsId(licenseTerms);
    // if (licenseTermsId !== 0n) {
    //   return { licenseTermsId: licenseTermsId };
    // }

    // Register PIL terms
    // const txHash = await this.licenseTemplateClient.registerLicenseTerms({ terms: licenseTerms });
    // if (request.txOptions?.waitForTransaction) {
    //   const txReceipt = await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
    //   const targetLogs = this.licenseTemplateClient.parseTxLicenseTermsRegisteredEvent(txReceipt);
    //   return { txHash: txHash, licenseTermsId: targetLogs[0].licenseTermsId };
    // } else {
    //   return { txHash: txHash };
    // }
  }   

  /**
   * parse tx receipt event LicenseTermsRegistered for contract PILicenseTemplate
   */
  // public parseTxLicenseTermsRegisteredEvent(
  //   txReceipt: TransactionReceipt,
  // ): Array<PiLicenseTemplateLicenseTermsRegisteredEvent> {
  //   const targetLogs: Array<PiLicenseTemplateLicenseTermsRegisteredEvent> = [];
  //   for (const log of txReceipt.logs) {
  //     try {
  //       const event = decodeEventLog({
  //         abi: piLicenseTemplateAbi,
  //         eventName: "LicenseTermsRegistered",
  //         data: log.data,
  //         topics: log.topics,
  //       });
  //       if (event.eventName === "LicenseTermsRegistered") {
  //         targetLogs.push(event.args);
  //       }
  //     } catch (e) {
  //       /* empty */
  //     }
  //   }
  //   return targetLogs;
  // }

  async _isRegistered(nftAddr: string, tokenId: number, chainId: string) {
    // Connecting to smart contract
    if (!this.contractWithMasterWallet) {
      this.contractWithMasterWallet = await this._getContract();
      if (!this.contractWithMasterWallet) {
        const errMsg = `can not get contract With Master Wallet`;
        this._logger.error(errMsg);
        throw new Error(errMsg);
      }
    }
    const ipId = await this.contractWithMasterWallet.ipId(
      ENV_CONFIG.NODE.CHAINID,
      nftAddr,
      tokenId
    );
    this._logger.log(`ipId ` + ipId);
    const isRegistered = await this.contractWithMasterWallet.isRegistered(ipId);
    if(isRegistered){
      return ipId;
    }else{
      return null;
    }
    
  }  
}
