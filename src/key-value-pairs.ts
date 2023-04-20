import { ValueUpdated as ValueUpdatedEvent } from "../generated/KeyValuePairs/KeyValuePairs"
import { DAO, ProposalTemplate, ProposalTemplateTransaction, ProposalTemplateTransactionParameter, BigNumberValue } from "../generated/schema"
import { ipfs, json, ByteArray } from "@graphprotocol/graph-ts"

export function handleValueUpdated(event: ValueUpdatedEvent): void {
  if (event.params.key === "proposalTemplates") {
    let dao = DAO.load(event.params.theAddress)
    if (dao) {
      let proposalTemplatesConfigFile = ipfs.cat(event.params.value)
      if (proposalTemplatesConfigFile) {
        let proposalTemplatesJSON = json.try_fromBytes(proposalTemplatesConfigFile)
        if (proposalTemplatesJSON && proposalTemplatesJSON.isOk) {
          let value = proposalTemplatesJSON.value.toArray()
          value.forEach(proposalTemplateJSON => {
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
              let transactionEntities = transactions.toArray().map((transactionJSON, i) => {
                let transaction = new ProposalTemplateTransaction(event.transaction.hash.concatI32(i))
                let transactionJSONOjbect = transactionJSON.toObject()

                let targetAddress = transactionJSONOjbect.get('targetAddress')
                if (targetAddress) {
                  transaction.targetAddress = ByteArray.fromHexString(targetAddress.toString())
                }

                let ethValue = transactionJSONOjbect.get('ethValue')
                // if (ethValue) {
                //   transaction.ethValue = ''
                // }

                let functionName = transactionJSONOjbect.get('functionName')

                let parameters = transactionJSONOjbect.get('parameters')
              })
            }
          })
        }
      }
    }
  }
}
