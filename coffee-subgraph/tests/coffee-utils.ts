import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  OwnershipTransferred,
  newFarm,
  newForeman,
  workerCheckedIn,
  workerPaid
} from "../generated/coffee/coffee"

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createnewFarmEvent(farmAddress: Address): newFarm {
  let newFarmEvent = changetype<newFarm>(newMockEvent())

  newFarmEvent.parameters = new Array()

  newFarmEvent.parameters.push(
    new ethereum.EventParam(
      "farmAddress",
      ethereum.Value.fromAddress(farmAddress)
    )
  )

  return newFarmEvent
}

export function createnewForemanEvent(
  farmAddress: Address,
  foreman: Address
): newForeman {
  let newForemanEvent = changetype<newForeman>(newMockEvent())

  newForemanEvent.parameters = new Array()

  newForemanEvent.parameters.push(
    new ethereum.EventParam(
      "farmAddress",
      ethereum.Value.fromAddress(farmAddress)
    )
  )
  newForemanEvent.parameters.push(
    new ethereum.EventParam("foreman", ethereum.Value.fromAddress(foreman))
  )

  return newForemanEvent
}

export function createworkerCheckedInEvent(
  foreman: Address,
  worker: Address,
  date: string
): workerCheckedIn {
  let workerCheckedInEvent = changetype<workerCheckedIn>(newMockEvent())

  workerCheckedInEvent.parameters = new Array()

  workerCheckedInEvent.parameters.push(
    new ethereum.EventParam("foreman", ethereum.Value.fromAddress(foreman))
  )
  workerCheckedInEvent.parameters.push(
    new ethereum.EventParam("worker", ethereum.Value.fromAddress(worker))
  )
  workerCheckedInEvent.parameters.push(
    new ethereum.EventParam("date", ethereum.Value.fromString(date))
  )

  return workerCheckedInEvent
}

export function createworkerPaidEvent(
  farm: Address,
  worker: Array<Address>,
  amount: BigInt,
  date: string
): workerPaid {
  let workerPaidEvent = changetype<workerPaid>(newMockEvent())

  workerPaidEvent.parameters = new Array()

  workerPaidEvent.parameters.push(
    new ethereum.EventParam("farm", ethereum.Value.fromAddress(farm))
  )
  workerPaidEvent.parameters.push(
    new ethereum.EventParam("worker", ethereum.Value.fromAddressArray(worker))
    
  )
  workerPaidEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  workerPaidEvent.parameters.push(
    new ethereum.EventParam("date", ethereum.Value.fromString(date))
  )

  return workerPaidEvent
}
