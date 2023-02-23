import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,

} from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
// import { ExampleEntity } from "../generated/schema"
import { OwnershipTransferred } from "../generated/coffee/coffee"
import { handleOwnershipTransferred, handleworkerPaid } from "../src/coffee"
import { createnewForemanEvent, createOwnershipTransferredEvent } from "./coffee-utils"
import {Farm, Foreman} from "../generated/schema"
import {createnewFarmEvent, createworkerPaidEvent} from "./coffee-utils"
import {handlenewFarm,handlenewForeman} from "../src/coffee"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0


beforeAll(()=>{
  let farm = new Farm ("0x0000000000000000000000000000000000000001");
  farm.save();


})

afterAll(()=>{
  clearStore()
})

test ("Creating farm",()=>{
  let address = Address.fromString("0x0000000000000000000000000000000000000002");

  let anotherFarm = createnewFarmEvent (address);

  handlenewFarm (anotherFarm);

  assert.fieldEquals("Farm", "0x0000000000000000000000000000000000000001", "id","0x0000000000000000000000000000000000000001");
  assert.fieldEquals("Farm", "0x0000000000000000000000000000000000000002", "id", "0x0000000000000000000000000000000000000002");


})

test("Creating a foreman",()=>{
  let farmAddress = Address.fromString("0x0000000000000000000000000000000000000001");
  let foremanAddress = Address.fromString("0x0000000000000000000000000000000000000003");

  
  let foreman = createnewForemanEvent(farmAddress,foremanAddress);
  handlenewForeman(foreman);
  assert.fieldEquals("Foreman","0x0000000000000000000000000000000000000003", "id", "0x0000000000000000000000000000000000000003");
})


test("Paying a worker before first check in ", ()=>{
  let farmAddress = Address.fromString("0x0000000000000000000000000000000000000001");
  let workerAddress = Address.fromString("0x0000000000000000000000000000000000000005")
  let payment = BigInt.fromI32(1);
  let day = "2023/02/23"
  let paid = createworkerPaidEvent(farmAddress,workerAddress,payment, day);

  handleworkerPaid(paid);
  }
)




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
