import {Web3} from "web3";
import { ENV_CONFIG } from '../shared/services/config.service';
import  IPAssetRegistryABI  from "./ABI/IPAssetRegistry.json"
import  { NFTAbi }  from "./ABI/NFT"
import { AbiItem } from 'web3-utils'

import * as abiDecoder from 'abi-decoder'; // NodeJS

export const web3 = new Web3(
    new Web3.providers.HttpProvider(ENV_CONFIG.NODE.RPC)
);

export async function getLastestBlockNumber() {
    return await web3.eth.getBlockNumber()
}

export const ADDRESS_0 = '0x0000000000000000000000000000000000000000'

export function Contract(address: string, abi: any) {
    return new web3.eth.Contract(abi, address)
}

export async function getPastEventsByContract(fromBlock, toBlock, contract) {
    const ipassetContract = new web3.eth.Contract(IPAssetRegistryABI as AbiItem[], contract );
    let options = {
        fromBlock: 6101840,//fromBlock, //Number || "earliest" || "pending" || "latest"
        toBlock: 6102072//toBlock
    }; 

    var newIPasset = await ipassetContract.getPastEvents('allEvents', options)

    await Promise.all(newIPasset.map(newIPassetEvent => new Promise(async (resolve, reject) => {
        try {

            console.log("Events added: " );  
            resolve(null)
        }
        catch (ex) {
            console.error(ex)
            reject(null)
        }
    })))    
    // console.log(`newIPasset: ` + JSON.stringify(newIPasset));
    return newIPasset
}

export async function parseTokenId(tx) {
    const result = await web3.eth.getTransactionReceipt(tx)
    const TRANSFER_EVENT_SIGNATURE = web3.utils.keccak256("minted(uint256,address)");
    let tokenId
    for (let log of result.logs) {
        if (log.topics[0] == TRANSFER_EVENT_SIGNATURE) {
            tokenId = web3.eth.abi.decodeParameter("uint256", log.topics[1].toString());
            break;
        }
    }

    return tokenId
}
