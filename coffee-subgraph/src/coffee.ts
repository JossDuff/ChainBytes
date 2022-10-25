import { Address, log } from "@graphprotocol/graph-ts"
import {
  coffee,
  OwnershipTransferred,
  newFarm,
  newForeman,
  workerCheckedIn,
  workerPaid
} from "../generated/coffee/coffee"
import { Worker, Farm, Foreman, Payment, CheckIn } from "../generated/schema"

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  // does nothing!
  // we don't have to handle owner relationships in thegraph, but we have to have this 
  // function signature or else syncing will fail.
}

// helper function.  Extracts the year, month, and day of a date string in format YYYY-MM-DD
// returns an i32 array with 3 entries: [year, month, day]
// ex: date "1990-01-03" returns [1990, 01, 03] January 3rd, 1990
function parseDate(date: string): i32[] {
  let thisYear:i32, thisMonth:i32, thisDay:i32;
  // first 4 chars are year
  thisYear = parseInt(date.slice(0,4)) as i32;
  // skip a char, and the next 2 are month
  thisMonth = parseInt(date.slice(5,7)) as i32;
  
  if(thisMonth>12){
    log.critical("Incorrect date: month is > 12",[]);
  }
  // skip a char, and the next 2 are day
  thisDay = parseInt(date.slice(8,10)) as i32;

  if(thisDay>31){
    log.critical("Incorrect date: day is > 31",[]);
  }

  return [thisYear, thisMonth, thisDay];
}

export function handlenewFarm(event: newFarm): void {
  // checks if a farm with that address already exists
  let newFarm = Farm.load(event.params.farmAddress.toHex());
  // if not, create the new farm
  if(!newFarm) {
    newFarm = new Farm(event.params.farmAddress.toHex());
    // newFarm.farmCheckIns = [];
    // newFarm.hasForemen = [];
    // newFarm.madePayments = [];
  }
  newFarm.save();
}

export function handlenewForeman(event: newForeman): void {
  // checks if a foreman with that address already exists
  let newForeman = Foreman.load(event.params.foreman.toHex());
  // if not, create the new foreman
  if(!newForeman) {
    newForeman = new Foreman(event.params.foreman.toHex());
    // sets to the farm who created the foreman
    newForeman.hasFarm = event.transaction.from.toHex();
    // newForeman.madeCheckIns = [];
    // newForeman.hasWorkers = [];
  }

  // Update farm
  // let farm = Farm.load(event.transaction.from.toHex());
  // if(!farm){
  //   farm = new Farm(event.transaction.from.toHex());
  //   // farm.farmCheckIns = [];
  //   // farm.hasForemen = [];
  //   // farm.madePayments = [];
  //   log.critical("newForeman event emitted but no farm with this address exists in table",[]);
  // }

  // add foreman to farm's hasForeman array
  // if(farm.hasForemen != null){
  //   if(!farm.hasForemen!.includes(newForeman.id)){
  //     farm.hasForemen!.push(newForeman.id);
  //   }
  // } else{
  //   farm.hasForemen = [newForeman.id];
  // }

  // farm.save();
  newForeman.save();
}

export function handleworkerCheckedIn(event: workerCheckedIn): void {
  // ╔═══════════════════════════╗
  // ║       LOAD FOREMAN        ║
  // ╚═══════════════════════════╝
  // - load the foreman. foreman should already exist

  let foreman = Foreman.load(event.params.foreman.toHex());
  // A checkin cannot exist without a foreman because coffee.sol
  // checkIn() function is only callable by a foreman, but
  // the subgraph doesn't know that so we have to have this check.
  if(!foreman) {
    foreman = new Foreman(event.params.foreman.toHex());
    foreman.hasFarm = event.transaction.from.toHex();
    // foreman.hasWorkers = [];
    // foreman.madeCheckIns = [];
    log.critical(
      "workerCheckedIn event emitted but no foreman with this address exists in table", 
      []
    );
  }
  
  // update worker and checkin table for each worker in event
  for (var i = 0; i< event.params.worker.length; i++) {
    let thisWorker = event.params.worker[i];
    // ╔═════════════════════════════╗
    // ║       UPDATE WORKER         ║
    // ╚═════════════════════════════╝
    // - create new worker if they don't exist
    //   - daysWorker = 1
    //   - daysUnpaid = 1
    //   - payments = []
    //   - hasForeman = event.params.foreman
      
    // - if worker exists, load
    //   - increment daysWorked and daysUnpaid 
    //   - add foreman to hasForeman array (if they aren't already there)

    // - add checkin to worker's checkIns array
    
    let worker = Worker.load(thisWorker.toHex());

    // if the worker doesn't exist, create one
    if(!worker){
      worker = new Worker(thisWorker.toHex());
      // being checked in means they worked one day
      worker.daysWorked = 1;
      // They haven't been paid yet since they get checked in before
      // they get paid.
      worker.daysUnpaid = 1;
      // worker.payments = [];
      worker.hasForeman = [event.params.foreman.toHex()];
      // worker.checkIns = [];
    }
    else {
      // if the worker exists, increment days worked 
      // and days unpaid by 1.
      worker.daysWorked += 1;
      worker.daysUnpaid += 1;
      if(worker.hasForeman!=null){
        if(!worker.hasForeman!.includes(event.params.foreman.toHex())) {
          let tempWorker = worker.hasForeman;
          tempWorker!.push(event.params.foreman.toHex());
          worker.hasForeman = tempWorker;
        }
      } else {
        worker.hasForeman = [event.params.foreman.toHex()];
      }
    }

      // ╔═════════════════════════════╗
      // ║       UPDATE CHECKIN        ║
      // ╚═════════════════════════════╝
      // - create new checkin
      // - set farmCheckedInAt to the foreman's farm
      // - set foremanWhoChecked to the foreman
      // - set workerChecked in to the worker
      // - set year, month, day to the parsed date

    // Create new checkin and sets the ID to transaction hash since hashes are unique
    let checkin = new CheckIn(
      event.transaction.hash.toHex() + event.logIndex.toString()
    );
    checkin.farmCheckedInAt = foreman.hasFarm;
    checkin.foremanWhoChecked = foreman.id;
    checkin.workerCheckedIn = worker.id;
    // Parse date and assign
    let parsedDate = parseDate(event.params.date);
    checkin.year = parsedDate[0];
    checkin.month = parsedDate[1];
    checkin.day = parsedDate[2];

    // save all entities modified
    worker.save();
    checkin.save();
  }

  foreman.save();
}

export function handleworkerPaid(event: workerPaid): void {
  for (var i = 0; i< event.params.worker.length; i++) {
    let thisWorker = event.params.worker[i];
    let thisPayment = event.params.amount[i];

    // ╔═════════════════════════════╗
    // ║       UPDATE WORKER         ║
    // ╚═════════════════════════════╝
    // - load worker.  Worker should already exist
    // - set worker daysUnpaid to 0
    // - add payment to worker's payment array
  
    let worker = Worker.load(thisWorker.toHex()); 
    // We are assuming that a worker will never be paid before being
    // checked in, so the worker should already exist.
    if(!worker){
      worker = new Worker(thisWorker.toHex());
      worker.daysWorked = 1;
      worker.daysUnpaid = 1;
      // worker.payments = [];
      worker.hasForeman = [];
      // worker.checkIns = [];
      log.critical("Worker was paid before being checked in", []);
    }
    // Worker is now paid for all their previous days unpaid
    let oldDaysUnpaid = worker.daysUnpaid;
    worker.daysUnpaid = 0;
  
      // ╔═════════════════════════════╗
      // ║       UPDATE PAYMENT        ║
      // ╚═════════════════════════════╝
      // - create new payment entry
      // - set year, month, day to parsed date
      // - amount = event.params.amount
      // - daysPaidFor = worker's daysUnpaid (before updating to 0)
      // - farmWhoPaid = event.params.farm
      // - workerPaid = event.params.worker
    
    let payment = new Payment(
      event.transaction.hash.toHex() + event.logIndex.toString()
    );
    payment.amount = thisPayment;
    payment.daysPaidFor = oldDaysUnpaid;
    // Parse date and assign
    let parsedDate = parseDate(event.params.date);
    payment.year = parsedDate[0];
    payment.month = parsedDate[1];
    payment.day = parsedDate[2];
    payment.farmWhoPaid = event.transaction.from.toHex();
    payment.workerPaid = worker.id;
    
    // save entities modified
    worker.save();
    payment.save();
  }
}



















  /*╔══════════════════════════════════════════════════════════╗
    ║       BELOW ARE JUST NOTES GENERATED BY THEGRAPH         ║
    ╚══════════════════════════════════════════════════════════╝*/
  
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
