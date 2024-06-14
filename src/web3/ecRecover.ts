import { keccak, fromRpcSig, ecrecover, pubToAddress, bufferToHex, toBuffer } from 'ethereumjs-util'

export function ecRecover(message, signature): string {
    // return await web3Fake.eth.personal.ecRecover(msg, signature)
    var nonce: any = "\x19Ethereum Signed Message:\n" + message.length + message
    nonce = keccak(Buffer.from(nonce, "utf-8"))
    
    if (signature.indexOf('0x') != 0) {
        signature = `0x${signature}`
    }
    var { v, r, s } = fromRpcSig(signature)
    var pubKey = ecrecover(toBuffer(nonce), v, r, s)
    var addrBuf = pubToAddress(pubKey)
    var addr = bufferToHex(addrBuf)
    return addr
}