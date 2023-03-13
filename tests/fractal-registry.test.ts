import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address } from "@graphprotocol/graph-ts"
import { FractalNameUpdated } from "../generated/schema"
import { FractalNameUpdated as FractalNameUpdatedEvent } from "../generated/FractalRegistry/FractalRegistry"
import { handleFractalNameUpdated } from "../src/fractal-registry"
import { createFractalNameUpdatedEvent } from "./fractal-registry-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let daoAddress = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let daoName = "Example string value"
    let newFractalNameUpdatedEvent = createFractalNameUpdatedEvent(
      daoAddress,
      daoName
    )
    handleFractalNameUpdated(newFractalNameUpdatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("FractalNameUpdated created and stored", () => {
    assert.entityCount("FractalNameUpdated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "FractalNameUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "daoAddress",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "FractalNameUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "daoName",
      "Example string value"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
