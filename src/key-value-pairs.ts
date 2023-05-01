import { crypto, ipfs, json, ByteArray, JSONValue, Bytes, log } from '@graphprotocol/graph-ts';
import { ValueUpdated as ValueUpdatedEvent } from '../generated/KeyValuePairs/KeyValuePairs';
import {
  DAO,
  ProposalTemplate,
  ProposalTemplateTransaction,
  ProposalTemplateTransactionParameter,
} from '../generated/schema';

export function handleValueUpdated(event: ValueUpdatedEvent): void {
  if (event.params.key === 'proposalTemplates') {
    let dao = DAO.load(event.params.theAddress);
    if (dao) {
      log.info('Processing proposal templates for DAO: {}, the IPFS hash is: {}', [
        event.params.theAddress.toString(),
        event.params.value,
      ]);
      let proposalTemplatesConfigFile = ipfs.cat(event.params.value);
      if (proposalTemplatesConfigFile) {
        let proposalTemplatesJSON = json.try_fromBytes(proposalTemplatesConfigFile);
        if (proposalTemplatesJSON && proposalTemplatesJSON.isOk) {
          let proposalTemplatesEntitiesIds: Bytes[] = proposalTemplatesJSON.value
            .toArray()
            .map<Bytes>((proposalTemplateJSON, proposalTemplateIndex) => {
              let proposalTemplate = new ProposalTemplate(
                Bytes.fromByteArray(crypto.keccak256(Bytes.fromI32(proposalTemplateIndex)))
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
                let transactionEntitiesIds = transactions
                  .toArray()
                  .map<Bytes>((transactionJSON: JSONValue, transactionIndex) => {
                    let transaction = new ProposalTemplateTransaction(
                      Bytes.fromByteArray(crypto.keccak256(Bytes.fromI32(transactionIndex)))
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
                      let parametersEntitiesIds = parameters
                        .toArray()
                        .map<Bytes>((parameterJSON, parameterIndex) => {
                          let parameter = new ProposalTemplateTransactionParameter(
                            Bytes.fromByteArray(crypto.keccak256(Bytes.fromI32(parameterIndex)))
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
                          return parameter.id;
                        });

                      transaction.parameters = parametersEntitiesIds;
                    }

                    transaction.save();
                    return transaction.id;
                  });

                proposalTemplate.transactions = transactionEntitiesIds;
              }
              proposalTemplate.save();
              return proposalTemplate.id;
            });

          dao.proposalTemplates = proposalTemplatesEntitiesIds;
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
