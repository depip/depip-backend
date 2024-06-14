import {Web3} from "web3";
import { ENV_CONFIG } from '../shared/services/config.service';

const web3 = new Web3(ENV_CONFIG.NODE.RPC) 

export async function getLastestBlockNumber() {
    return await web3.eth.getBlockNumber()
}

export const ADDRESS_0 = '0x0000000000000000000000000000000000000000'

// export const UniversalContract = (network) => Contract(network.RPC, network.UNIVERSAL, TomoBridgeUniversalABI)

// export async function getSwapLogEventByTxHash(network, txHash: string) {
//     let web3 = Web3(network.RPC)
//     let eventName = ['LogDeposit', 'LogWithdraw']
//     var transaction = await web3.eth.getTransactionReceipt(txHash)

//     var events = []
//     for(var i = 0; i < eventName.length; i++){
//         var eventLogs = TomoBridgeUniversalABI.find(e => e.name == eventName[i])
//         var eventSignature = web3.eth.abi.encodeEventSignature(eventLogs as any)   

//         let event = transaction.logs
//             .filter(e => e.topics[0] == eventSignature)
//             .map(log => web3.eth.abi.decodeLog(eventLogs.inputs, log.data, log.topics.slice(1)))

//         if(event.length > 0){
//             events = [...events, ...event]
//         }

        
//     }
//     return events
// }

// export async function getClaimLogEventByTxHash(network, txHash: string) {
//     let web3 = Web3(network.RPC)
//     let eventName = ['LogExecMintTX', 'LogExecBurnTX']

//     var transaction = await web3.eth.getTransactionReceipt(txHash)

//     var events = []
//     for(var i = 0; i < eventName.length; i++){
//         var eventLogs = TomoBridgeUniversalABI.find(e => e.name == eventName[i])
//         var eventSignature = web3.eth.abi.encodeEventSignature(eventLogs as any)   

//         let event = transaction.logs
//             .filter(e => e.topics[0] == eventSignature)
//             .map(log => web3.eth.abi.decodeLog(eventLogs.inputs, log.data, log.topics.slice(1)))

//         if(event.length > 0){
//             events = [...events, ...event]
//         }

        
//     }
//     return events
// }