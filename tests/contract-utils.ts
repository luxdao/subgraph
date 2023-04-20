import { newMockEvent } from "matchstick-as"
import { ethereum, Address } from "@graphprotocol/graph-ts"
import { ValueUpdated } from "../generated/Contract/Contract"

export function createValueUpdatedEvent(
  theAddress: Address,
  key: string,
  value: string
): ValueUpdated {
  let valueUpdatedEvent = changetype<ValueUpdated>(newMockEvent())

  valueUpdatedEvent.parameters = new Array()

  valueUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "theAddress",
      ethereum.Value.fromAddress(theAddress)
    )
  )
  valueUpdatedEvent.parameters.push(
    new ethereum.EventParam("key", ethereum.Value.fromString(key))
  )
  valueUpdatedEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromString(value))
  )

  return valueUpdatedEvent
}
