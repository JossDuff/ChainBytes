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
import { handleOwnershipTransferred, handleworkerCheckedIn, handleworkerPaid } from "../src/coffee"
import { createnewForemanEvent, createOwnershipTransferredEvent } from "./coffee-utils"
import {Farm, Foreman} from "../generated/schema"
import {createnewFarmEvent, createworkerPaidEvent, createworkerCheckedInEvent} from "./coffee-utils"
import {handlenewFarm,handlenewForeman} from "../src/coffee"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0


beforeAll(()=>{
  //create farm to be used in tests below
  let farmAddress = Address.fromString("0x0000000000000000000000000000000000000001");
  let farm = createnewFarmEvent (farmAddress);
  handlenewFarm (farm);

  //create forman to be used below
  let foremanAddress = Address.fromString("0x0000000000000000000000000000000000000002");
  let foreman = createnewForemanEvent(farmAddress,foremanAddress);
  handlenewForeman(foreman);


  //Check in a worker to be used below
  let workerAddress = Address.fromString("0x0000000000000000000000000000000000000005");
  let workerArray : Array<Address> =  [workerAddress];
  let checkin = createworkerCheckedInEvent(foremanAddress, workerArray, "2023/02/23" );
  handleworkerCheckedIn(checkin);
  


})

//after all tests, clear
afterAll(()=>{
  clearStore()
})

//creates farm and tests that it exists and its id is the wallet address
test ("Creating farm",()=>{

  let address = Address.fromString("0x0000000000000000000000000000000000000003");

  let anotherFarm = createnewFarmEvent (address);

  handlenewFarm (anotherFarm);

  assert.fieldEquals("Farm", "0x0000000000000000000000000000000000000003", "id", "0x0000000000000000000000000000000000000003");


})

//create foremand and tests that its id is its address
test("Creating a foreman",()=>{
  let farmAddress = Address.fromString("0x0000000000000000000000000000000000000001");
  let foremanAddress = Address.fromString("0x0000000000000000000000000000000000000004");

  
  let foreman = createnewForemanEvent(farmAddress,foremanAddress);
  handlenewForeman(foreman);
  assert.fieldEquals("Foreman","0x0000000000000000000000000000000000000004", "id", "0x0000000000000000000000000000000000000004");
})

//checks in a worker
test("Worker Check in", ()=>{
  let workerAddress = Address.fromString("0x0000000000000000000000000000000000000005");
  let foremanAddress = Address.fromString("0x0000000000000000000000000000000000000002");
  let workerArray : Array<Address> =  [workerAddress];
  let checkin = createworkerCheckedInEvent(foremanAddress, workerArray, "2023/02/23" );
  handleworkerCheckedIn(checkin);
}
)


test("Paying a worker before first check in ", ()=>{
  let farmAddress = Address.fromString("0x0000000000000000000000000000000000000001");
  let workerAddress1 = Address.fromString("0x0000000000000000000000000000000000000005");
  let workerAddress2 = Address.fromString("0x0000000000000000000000000000000000000006");
  let workerArray : Array<Address> = [workerAddress1, workerAddress2];
  let payment = BigInt.fromI32(1);
  let paymentArray : Array<BigInt> = [payment,payment];
  let day = "2023/02/23";
  let paid = createworkerPaidEvent(farmAddress,workerArray,paymentArray, day);

  handleworkerPaid(paid);

  }
)



/*
  test("Checking in a worker from a non-forman address", ()=>{

    //this forman address is  not a logged forman address
    let foremanAddress = Address.fromString("0x0000000000000000000000000000000000000995")

    //valid worker address from beforeAll()
    let workerAddress = Address.fromString("0x0000000000000000000000000000000000000005");
    let workerArray : Array<Address> =  [workerAddress];

    //create checkin event and handle it
    let checkin = createworkerCheckedInEvent(foremanAddress, workerArray, "2023/03/03");
    handleworkerCheckedIn(checkin);

    //test passes if the worker is not checked in
    //assert.fieldEquals("Worker Checked In", "0x0000000000000000000000000000000000000005", "checkedIn", "false");
    
  }
  )
  */

  test("Paying a worker from a non-farm address", ()=>{
    let farmAddress = Address.fromString(   "0x0000000000000000000000000000000000034345");
    let workerAddress1 = Address.fromString("0x0000000000000000000000000000000000000005");
    let workerAddress2 = Address.fromString("0x0000000000000000000000000000000000000006");
  
    let workerArray : Array<Address> = [workerAddress1, workerAddress2];
    let payment = BigInt.fromI32(1);
    let paymentArray : Array<BigInt> = [payment,payment];
    let day = "2023/02/23";
  
    let paid = createworkerPaidEvent(farmAddress,workerArray,paymentArray, day);
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
