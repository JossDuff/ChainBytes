import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
// import { ExampleEntity } from "../generated/schema"
import { OwnershipTransferred } from "../generated/coffee/coffee"
import { handleOwnershipTransferred } from "../src/coffee"
import { createOwnershipTransferredEvent } from "./coffee-utils"
import {Farm } from "../generated/schema"
import {createnewFarmEvent} from "./coffee-utils"
import {handlenewFarm} from "../src/coffee"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0


test ("Creating farm",()=>{
  let farm = new Farm ("0x0000000000000000000000000000000000000001");
  farm.save();
  let address = Address.fromString("0x0000000000000000000000000000000000000002");

  let anotherFarm = createnewFarmEvent (address);

  handlenewFarm (anotherFarm);

  assert.fieldEquals("Farm", "0x0000000000000000000000000000000000000001", "id","0x0000000000000000000000000000000000000001");
  assert.fieldEquals("Farm", "0x0000000000000000000000000000000000000002", "id", "0x0000000000000000000000000000000000000002");
  



})

// describe("Describe entity assertions", () => {
//   beforeAll(() => {
//     let previousOwner = Address.fromString(
//       "0x0000000000000000000000000000000000000001"
//     )
//     let newOwner = Address.fromString(
//       "0x0000000000000000000000000000000000000001"
//     )
//     let newOwnershipTransferredEvent = createOwnershipTransferredEvent(
//       previousOwner,
//       newOwner
//     )
//     handleOwnershipTransferred(newOwnershipTransferredEvent)
//   })

//   afterAll(() => {
//     clearStore()
//   })

//   // For more test scenarios, see:
//   // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

//   test("ExampleEntity created and stored", () => {
//     assert.entityCount("ExampleEntity", 1)

//     // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
//     assert.fieldEquals(
//       "ExampleEntity",
//       "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
//       "previousOwner",
//       "0x0000000000000000000000000000000000000001"
//     )
//     assert.fieldEquals(
//       "ExampleEntity",
//       "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
//       "newOwner",
//       "0x0000000000000000000000000000000000000001"
//     )

//     // More assert options:
//     // https://thegraph.com/docs/en/developer/matchstick/#asserts
//   })
// })
