import { CONST_CHAR, CONST_MSG_TYPE } from '../common/constants/app.constant';
export class SyncDataHelpers {
  static makeTxRawLogData(txData: any) {
    let txType = 'FAILED',
      txRawLogData,
      txContractAddress;
    if (txData.tx_response.code === 0) {
      const txLog = JSON.parse(txData.tx_response.raw_log);

      const txAttr = txLog[0].events.find(
        ({ type }) => type === CONST_CHAR.MESSAGE,
      );
      const txAction = txAttr.attributes.find(
        ({ key }) => key === CONST_CHAR.ACTION,
      );
      const regex = /_/gi;
      txType = txAction.value.replace(regex, ' ');

      const txMsgType = txType.substring(txType.lastIndexOf('.') + 1);
      if (txMsgType == CONST_MSG_TYPE.MSG_WITHDRAW_DELEGATOR_REWARD) {
        const amount = txData.tx_response.logs[0].events.find(
          ({ type }) => type === CONST_CHAR.WITHDRAW_REWARDS,
        );
        amount.attributes = amount.attributes.filter(
          (x) => x.key == CONST_CHAR.AMOUNT,
        );
        txRawLogData = JSON.stringify(amount);
      } else if (
        txMsgType == CONST_MSG_TYPE.MSG_DELEGATE ||
        txMsgType == CONST_MSG_TYPE.MSG_REDELEGATE ||
        txMsgType == CONST_MSG_TYPE.MSG_UNDELEGATE
      ) {
        const amount = txData.tx_response.tx.body.messages[0].amount;
        let reward;
        try {
          reward = txData.tx_response.logs[0].events
            .find(({ type }) => type === CONST_CHAR.TRANSFER)
            .attributes.filter((x) => x.key == CONST_CHAR.AMOUNT);
        } catch (error) {
          reward = 0;
        }
        const rawData = {
          amount,
          reward,
        };
        txRawLogData = JSON.stringify(rawData);
      } else if (txMsgType == CONST_MSG_TYPE.MSG_INSTANTIATE_CONTRACT) {
        const contract_address = txData.tx_response.logs[0].events
          .find(({ type }) => type === CONST_CHAR.INSTANTIATE)
          .attributes.find(
            ({ key }) => key === CONST_CHAR._CONTRACT_ADDRESS,
          ).value;
        txContractAddress = contract_address;
      } else if (txMsgType == CONST_MSG_TYPE.MSG_EXECUTE_CONTRACT) {
        txContractAddress = txData.tx.body.messages[0].contract;
      }
    } else {
      const txBody = txData.tx_response.tx.body.messages[0];
      txType = txBody['@type'];
    }
    return [txType, txRawLogData, txContractAddress];
  }
}
