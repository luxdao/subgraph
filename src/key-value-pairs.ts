import { ValueUpdated as ValueUpdatedEvent } from "../generated/KeyValuePairs/KeyValuePairs"
import { DAO, ProposalTemplate, ProposalTemplateTransaction, ProposalTemplateTransactionParameter } from "../generated/schema"
import { ipfs, json, ByteArray } from "@graphprotocol/graph-ts"

export function handleValueUpdated(event: ValueUpdatedEvent): void {
  if (event.params.key === "proposalTemplates") {
    let dao = DAO.load(event.params.theAddress)
    if (dao) {
      let proposalTemplatesConfigFile = ipfs.cat(event.params.value)
      if (proposalTemplatesConfigFile) {
        let proposalTemplatesJSON = json.try_fromBytes(proposalTemplatesConfigFile)
        if (proposalTemplatesJSON && proposalTemplatesJSON.isOk) {
          let proposalTemplatesEntitiesIds = proposalTemplatesJSON.value.toArray().map(proposalTemplateJSON => {
            let proposalTemplate = new ProposalTemplate(event.transaction.hash)
            let proposalTemplateJSONObject = proposalTemplateJSON.toObject()

            let title = proposalTemplateJSONObject.get('title')
            if (title) {
              proposalTemplate.title = title.toString()
            }

            let description = proposalTemplateJSONObject.get('description')
            if (description) {
              proposalTemplate.description = description.toString()
            }

            let transactions = proposalTemplateJSONObject.get('transactions')

            if (transactions) {
              let transactionEntitiesIds = transactions.toArray().map((transactionJSON, index) => {
                let transaction = new ProposalTemplateTransaction(event.transaction.hash.concatI32(index))
                let transactionJSONOjbect = transactionJSON.toObject()

                let targetAddress = transactionJSONOjbect.get('targetAddress')
                if (targetAddress) {
                  transaction.targetAddress = ByteArray.fromHexString(targetAddress.toString())
                }

                let transactionEthValue = transactionJSONOjbect.get('ethValue')
                if (transactionEthValue) {
                  let ethValue = transactionEthValue.toObject().get('value')
                  if (ethValue) {
                    transaction.ethValue = ethValue.toString()
                  }
                }

                let functionName = transactionJSONOjbect.get('functionName')
                if (functionName) {
                  transaction.functionName = functionName.toString()
                }

                let parameters = transactionJSONOjbect.get('parameters')
                if (parameters) {
                  let parametersEntitiesIds = parameters.toArray().map((parameterJSON, parameterIndex) => {
                    let parameter = new ProposalTemplateTransactionParameter(event.block.hash.concatI32(index).concatI32(parameterIndex))
                    let parameterJSONObject = parameterJSON.toObject()

                    let signature = parameterJSONObject.get('signature')
                    if (signature) {
                      parameter.signature = signature.toString()
                    }

                    let parameterValue = parameterJSONObject.get('value')
                    if (parameterValue) {
                      parameter.value = parameterValue.toString()
                    } else {
                      // Prevent storing both label and value
                      let label = parameterJSONObject.get('label')
                      if (label) {
                        parameter.label = label.toString()
                      }
                    }

                    parameter.save()
                    return parameter.id
                  })

                  transaction.parameters = parametersEntitiesIds
                }

                transaction.save()
                return transaction.id
              })

              proposalTemplate.transactions = transactionEntitiesIds
            }
            proposalTemplate.save()
            return proposalTemplate.id
          })
          dao.proposalTemplates = proposalTemplatesEntitiesIds
        }
      }
    }
  }
}
