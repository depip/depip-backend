import {Web3} from "web3";
import { ENV_CONFIG } from '../shared/services/config.service';
import  IPAssetRegistryABI  from "./ABI/IPAssetRegistry.json"
import { AbiItem } from 'web3-utils'

// const web3 = new Web3(ENV_CONFIG.NODE.RPC) 

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
    console.log(`newIPasset: ` + JSON.stringify(newIPasset));
    return newIPasset
}
