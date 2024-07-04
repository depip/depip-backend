import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { findLast } from 'lodash';
import { ENV_CONFIG } from '../../shared/services/config.service';
import { IpassetService } from '../ipasset/ipasset.service';
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
    // ToDo
    // const licenseTerms = getLicenseTermByType(PIL_TYPE.COMMERCIAL_USE, {
    //   mintingFee: request.mintingFee,
    //   currency: request.currency,
    //   royaltyPolicyLAPAddress: this.royaltyPolicyLAPClient.address,
    // });

    // const licenseTermsId = await this.getLicenseTermsId(licenseTerms);
    // if (licenseTermsId !== 0n) {
    //   return { licenseTermsId: licenseTermsId };
    // }
    
    // const txHash = await this.licenseTemplateClient.registerLicenseTerms({ terms: licenseTerms });
    // if (request.txOptions?.waitForTransaction) {
    //   const txReceipt = await this.rpcClient.waitForTransactionReceipt({ hash: txHash });
    //   const targetLogs = this.licenseTemplateClient.parseTxLicenseTermsRegisteredEvent(txReceipt);
    //   return { txHash: txHash, licenseTermsId: targetLogs[0].licenseTermsId };
    // } else {
    //   return { txHash: txHash };
    // }

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

  async _registerPILTerms() {
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
