import { BigInt } from "@graphprotocol/graph-ts"
import {
  coffee,
  OwnershipTransferred,
  newFarm,
  newForeman,
  workerCheckedIn,
  workerPaid
} from "../generated/coffee/coffee"
import { Worker, Farm, Owner, Foreman, Payment, CheckIn } from "../generated/schema"


export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  // Creates new owner entry and sets 
  let newOwner = new Owner(event.params.newOwner);
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  // let entity = ExampleEntity.load(event.transaction.from.toHex())

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  // if (!entity) {
  //   entity = new ExampleEntity(event.transaction.from.toHex())

    // Entity fields can be set using simple assignments
  //   entity.count = BigInt.fromI32(0)
  //}

  // BigInt and BigDecimal math are supported
  // entity.count = entity.count + BigInt.fromI32(1)

  // Entity fields can be set based on event parameters
  //entity.previousOwner = event.params.previousOwner
  //entity.newOwner = event.params.newOwner

  // Entities can be written to the store with `.save()`
  //entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.isFarm(...)
  // - contract.isForeman(...)
  // - contract.owner(...)
}

export function handlenewFarm(event: newFarm): void {}

export function handlenewForeman(event: newForeman): void {}

export function handleworkerCheckedIn(event: workerCheckedIn): void {}

export function handleworkerPaid(event: workerPaid): void {}
