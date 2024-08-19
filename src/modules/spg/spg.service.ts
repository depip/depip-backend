import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ENV_CONFIG } from '../../shared/services/config.service';
import { CommonUtil } from '../../utils/common.util';
import { IPFSService } from '../files/ipfs.service';
import { IMetadata } from './interfaces/metadata';
import SpgABI from '../../web3/ABI/SPG.json'
import NftABI from '../../web3/ABI/NFT.json'
import AccessControllerABI from '../../web3/ABI/AccessController.json'
import { parseTokenId } from '../../web3';
import { IpassetService } from '../ipasset/ipasset.service';
import { SmartAccountService } from '../particleAccounts/smartAccount.service';
import * as fs from 'fs';
import path from 'path';

const  SPGABIPath = "../../web3/ABI/SPG.json"
const  NFTABIPath = "../../web3/ABI/NFT.json"
const  AccessControllerABIPath = "../../web3/ABI/AccessController.json"

@Injectable()
export class SPGService {
  private readonly _logger = new Logger(SPGService.name);
  private SPGAddr: string = ENV_CONFIG.STORY_PROTOCOL_CONTRACT.SPG;
  private SPGContract = null;
  private SPGAbi = [];
  private NFTAddr: string = ENV_CONFIG.STORY_PROTOCOL_CONTRACT.NFT;
  private NFTContract = null;
  private NFTAbi = [];  
  private AccessControllerAddr: string = ENV_CONFIG.STORY_PROTOCOL_CONTRACT.ACCESSCONTROLLER_ADDRESS;
  private AccessControllerContract = null;
  private AccessControllerAbi = []; 

  constructor(
    private commonUtil: CommonUtil,
    private ipfsService: IPFSService,
    private ipassetService: IpassetService,
    private smartAccountService: SmartAccountService,
  ) {}    

  async mintAndRegistryIp(name: string, description: string, recipient: string, session, image: Express.Multer.File, userWallet: string) {
    this._logger.log(`perform mint a nft! `);
    try {
      // Connecting to smart contract
      if (!this.SPGContract) {
        if (this.SPGAbi.length == 0) {
          const abiFilePath = path.resolve(__dirname, SPGABIPath);
          const files = fs.readFileSync(abiFilePath);
          this.SPGAbi = JSON.parse(files.toString());
        }

        this.SPGContract = await this.commonUtil.getContract(this.SPGAddr, this.SPGAbi);
        if (!this.SPGContract) {
          const errMsg = `can not get SPGContract`;
          this._logger.error(errMsg);
          throw new Error(errMsg);
        }
      }

      if (!this.NFTContract) {
        if (this.NFTAbi.length == 0) {
          const abiFilePath = path.resolve(__dirname, NFTABIPath);
          const files = fs.readFileSync(abiFilePath);
          this.NFTAbi = JSON.parse(files.toString());
        }

        this.NFTContract = await this.commonUtil.getContract(this.NFTAddr, this.NFTAbi);
        if (!this.NFTContract) {
          const errMsg = `can not get NFTContract`;
          this._logger.error(errMsg);
          throw new Error(errMsg);
        }
      }      

      //   - upload nft images to ipfs
      const ipfs = await this.ipfsService.uploadImageToIpfs(image);  

      const metadataObjects: IMetadata =  ({
          name: name,
          description: description,
          attributes: [],
          image: `ipfs://${ipfs}`,
        });

        const medatadaCid =
        await this.ipfsService.uploadMetadataToIpfs(
          metadataObjects,
          "/depip-metadata/",
          ipfs
        );
      const metadataIpfsLink = `https://ipfs-gw.dev.aura.network/ipfs/${medatadaCid}`;
      console.log(`\n\nUploaded metadata. Link: ${metadataIpfsLink}`);        

      //   - Mint NFT 
      const tx = await this.NFTContract.mintTokens(
                                                    recipient,
                                                    metadataIpfsLink
                                                  );     
      const res = await tx.wait();  
      if (res.status !== 1) {
        // alert('error message');
        return "Mint nft fail: " + res.hash
      }else{           
      const tokenId = await parseTokenId(tx.hash);   
      console.log("tokenId: " + tokenId);  
      // - Register IPaseet
      const ipIdRegisted = await this.ipassetService.registerIpassetOld(this.NFTAddr, tokenId.toString())

      return {
        nft: {
          status: "success",
          tokenId: tokenId.toString(),
          tx: tx.hash
        },
        ipasset: ipIdRegisted,
      }
    }

    } catch (error) {
      this._logger.log(
        `error when mint nft :${name}`,
        error.stack,
      );
      return {
        status: "fail",
        error: error,
      }
    }       
  }

  async setPermission(ipAccount: string, signer: string, permission: number, userWallet: string, session) {
    this._logger.log(`perform setPermission! `);
    try {
      // Connecting to smart contract
      if (!this.AccessControllerContract) {
        if (this.AccessControllerAbi.length == 0) {
          const abiFilePath = path.resolve(__dirname, AccessControllerABIPath);
          const files = fs.readFileSync(abiFilePath);
          this.AccessControllerAbi = JSON.parse(files.toString());
        }

        this.AccessControllerContract = await this.commonUtil.getContract(this.AccessControllerAddr, this.AccessControllerAbi);
        if (!this.AccessControllerContract) {
          const errMsg = `can not get AccessControllerContract`;
          this._logger.error(errMsg);
          throw new Error(errMsg);
        }
      }  
      
      const txRaw = await this.AccessControllerContract.setAllPermissions.populateTransaction(ipAccount, signer, permission);
      const txSigned = await this.smartAccountService.signAndSendTx(userWallet, txRaw, session)   
      
      if (txSigned.error) {
        // alert('error message');
        return {
          status: "fail",
          error: txSigned.error.data.extraMessage
        }

      }else{
        return {
          status: "success",
          tx: txSigned.result,
        }
      }        

    } catch (error) {
      this._logger.log(
        `error when setPermission :${ipAccount}`,
        error.stack,
      );
      return {
        status: "fail",
        error: error,
      }
    }       
  }  
}
