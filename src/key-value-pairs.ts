import { ipfs, json, ByteArray, Bytes, log, JSONValueKind } from '@graphprotocol/graph-ts';
import { ValueUpdated as ValueUpdatedEvent } from '../generated/KeyValuePairs/KeyValuePairs';
import {
  DAO,
  ProposalTemplate,
  ProposalTemplateTransaction,
  ProposalTemplateTransactionParameter,
} from '../generated/schema';

export function handleValueUpdated(event: ValueUpdatedEvent): void {
  if (event.params.key == 'proposalTemplates') {
    let dao = DAO.load(event.params.theAddress);
    if (dao) {
      log.info('Processing proposal templates for DAO: {}, the IPFS hash is: {}', [
        event.params.theAddress.toHexString(),
        event.params.value,
      ]);
      let proposalTemplatesConfigFile = ipfs.cat(event.params.value);
      if (proposalTemplatesConfigFile) {
        let proposalTemplatesJSON = json.try_fromBytes(proposalTemplatesConfigFile);
        if (proposalTemplatesJSON && proposalTemplatesJSON.isOk) {
          const proposalTemplatesEntitiesIds: Bytes[] = [];
          const proposalTemplateJSONArray = proposalTemplatesJSON.value.toArray();

          for (
            let proposalTemplateIndex = 0;
            proposalTemplateIndex < proposalTemplateJSONArray.length;
            proposalTemplateIndex++
          ) {
            let proposalTemplateJSON = proposalTemplateJSONArray[proposalTemplateIndex];
            if (proposalTemplateJSON.kind == JSONValueKind.OBJECT) {
              let proposalTemplate = new ProposalTemplate(
                Bytes.fromUTF8(
                  event.transaction.hash.toHex() + '-' + proposalTemplateIndex.toString()
                )
              );
              let proposalTemplateJSONObject = proposalTemplateJSON.toObject();

              let title = proposalTemplateJSONObject.get('title');
              if (title) {
                proposalTemplate.title = title.toString();
              }

              let description = proposalTemplateJSONObject.get('description');
              if (description) {
                proposalTemplate.description = description.toString();
              }

              let transactions = proposalTemplateJSONObject.get('transactions');

              if (transactions) {
                const transactionEntitiesIds: Bytes[] = [];
                const transactionsJSONArray = transactions.toArray();

                for (
                  let transactionIndex = 0;
                  transactionIndex < transactionsJSONArray.length;
                  transactionIndex++
                ) {
                  let transactionJSON = transactionsJSONArray[transactionIndex];
                  if (transactionJSON.kind == JSONValueKind.OBJECT) {
                    let transaction = new ProposalTemplateTransaction(
                      Bytes.fromUTF8(
                        event.transaction.hash.toHex() +
                          '-' +
                          event.logIndex.toHex() +
                          transactionIndex.toString()
                      )
                    );
                    let transactionJSONObject = transactionJSON.toObject();

                    let targetAddress = transactionJSONObject.get('targetAddress');
                    if (targetAddress) {
                      transaction.targetAddress = Bytes.fromByteArray(
                        ByteArray.fromHexString(targetAddress.toString())
                      );
                    }

                    let transactionEthValue = transactionJSONObject.get('ethValue');
                    if (transactionEthValue) {
                      let ethValue = transactionEthValue.toObject().get('value');
                      if (ethValue) {
                        transaction.ethValue = ethValue.toString();
                      }
                    }

                    let functionName = transactionJSONObject.get('functionName');
                    if (functionName) {
                      transaction.functionName = functionName.toString();
                    }

                    let parameters = transactionJSONObject.get('parameters');
                    if (parameters) {
                      let parametersEntitiesIds: Bytes[] = [];
                      let parametersJSONArray = parameters.toArray();

                      for (
                        let parameterIndex = 0;
                        parameterIndex < parametersJSONArray.length;
                        parameterIndex++
                      ) {
                        let parameterJSON = parametersJSONArray[parameterIndex];
                        if (parameterJSON.kind == JSONValueKind.OBJECT) {
                          let parameter = new ProposalTemplateTransactionParameter(
                            Bytes.fromUTF8(
                              event.transaction.hash.toHex() +
                                event.transaction.from.toHex() +
                                parameterIndex.toString()
                            )
                          );
                          let parameterJSONObject = parameterJSON.toObject();

                          let signature = parameterJSONObject.get('signature');
                          if (signature) {
                            parameter.signature = signature.toString();
                          }

                          let parameterValue = parameterJSONObject.get('value');
                          if (parameterValue) {
                            parameter.value = parameterValue.toString();
                          } else {
                            // Prevent storing both label and value
                            let label = parameterJSONObject.get('label');
                            if (label) {
                              parameter.label = label.toString();
                            }
                          }

                          parameter.save();
                          parametersEntitiesIds.push(parameter.id);
                        } else {
                          log.error('The parameter is not an object. It has following kind: {}', [
                            parameterJSON.kind.toString(),
                          ]);
                          return;
                        }
                      }

                      transaction.parameters = parametersEntitiesIds;
                    }

                    transaction.save();
                    transactionEntitiesIds.push(transaction.id);
                  } else {
                    log.error('Transaction is not an object. It has following kind: {}', [
                      transactionJSON.kind.toString(),
                    ]);
                    return;
                  }
                }

                proposalTemplate.transactions = transactionEntitiesIds;
              }
              proposalTemplate.save();
              proposalTemplatesEntitiesIds.push(proposalTemplate.id);
            } else {
              log.error('The kind of proposal template is not an object. Actual kind is: {}', [
                proposalTemplateJSON.kind.toString(),
              ]);
            }
          }

          dao.proposalTemplates = proposalTemplatesEntitiesIds;
          dao.save();
        } else {
          log.error('Failed to parse proposal templates JSON configuration: {}', [
            proposalTemplatesJSON.error.toString(),
          ]);
        }
      } else {
        log.error('JSON configuration is not found through IPFS hash: {}', [event.params.value]);
      }
    }
  } else {
    log.warning('Unkown key: {}', [event.params.key]);
  }
}
