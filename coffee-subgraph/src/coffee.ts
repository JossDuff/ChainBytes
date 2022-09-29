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

// helper function.  Extracts the year, month, and day of a date string in format YYYYMMDD
// returns an i32 array with 3 entries: [year, month, day]
// ex: date "19900103" returns [1990, 01, 03] January 3rd, 1990
function parseDate(date: string): i32[] {
  let thisYear:i32, thisMonth:i32, thisDay:i32;
  // first 4 chars are year
  thisYear = parseInt(date.slice(0,4)) as i32;
  // next 2 chars are month
  thisMonth = parseInt(date.slice(4,6)) as i32;
  if(thisMonth>12){
    log.critical("Incorrect date: month is > 12",[]);
  }
  // last 2 chars are days
  // omitting the second parameter slices out the rest of the string
  thisDay = parseInt(date.slice(6)) as i32;
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
    newFarm.farmCheckIns = [];
    newFarm.hasForemen = [];
    newFarm.madePayments = [];
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
    newForeman.madeCheckIns = [];
    newForeman.hasWorkers = [];
  }

  // Update farm
  let farm = Farm.load(event.transaction.from.toHex());
  if(!farm){
    farm = new Farm(event.transaction.from.toHex());
    farm.farmCheckIns = [];
    farm.hasForemen = [];
    farm.madePayments = [];
    log.critical("newForeman event emitted but no farm with this address exists in table",[]);
  }

  // add foreman to farm's hasForeman array
  if(farm.hasForemen != null){
    if(!farm.hasForemen!.includes(newForeman.id)){
      farm.hasForemen!.push(newForeman.id);
    }
  } else{
    farm.hasForemen = [newForeman.id];
  }

  farm.save();
  newForeman.save();
}

export function handleworkerCheckedIn(event: workerCheckedIn): void {

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
  

  let worker = Worker.load(event.params.worker.toHex());

  // if the worker doesn't exist, create one
  if(!worker){
    worker = new Worker(event.params.worker.toHex());
    // being checked in means they worked one day
    worker.daysWorked = 1;
    // They haven't been paid yet since they get checked in before
    // they get paid.
    worker.daysUnpaid = 1;
    worker.payments = [];
    worker.hasForeman = [event.params.foreman.toHex()];
    worker.checkIns = [];
  }
  else {
    // if the worker exists, increment days worked 
    // and days unpaid by 1.
    worker.daysWorked += 1;
    worker.daysUnpaid += 1;
    if(worker.hasForeman!=null){
      if(!worker.hasForeman!.includes(event.params.foreman.toHex())) {
        worker.hasForeman!.push(event.params.foreman.toHex());
      }
    } else {
      worker.hasForeman = [event.params.foreman.toHex()];
    }
  }


    // ╔═════════════════════════════╗
    // ║       UPDATE FOREMAN        ║
    // ╚═════════════════════════════╝
    // - load the foreman. foreman should already exist
    // - add worker to the hasWorker array (if they don't already exist)
    // - add the checkin to foreman's madeCheckin's array
  
  let foreman = Foreman.load(event.params.foreman.toHex());
  // A checkin cannot exist without a foreman because coffee.sol
  // checkIn() function is only callable by a foreman, but
  // the subgraph doesn't know that so we have to have this check.
  if(!foreman) {
    foreman = new Foreman(event.params.foreman.toHex());
    foreman.hasFarm = event.transaction.from.toHex();
    foreman.hasWorkers = [];
    foreman.madeCheckIns = [];
    log.critical(
      "workerCheckedIn event emitted but no foreman with this address exists in table", 
      []
    );
  }

  // If the array of associated workers for a foreman doesn't
  // already include this worker, add this worker to the array.
  if(foreman.hasWorkers != null){
    if(!foreman.hasWorkers!.includes(worker.id)){
      foreman.hasWorkers!.push(worker.id);
    }
  } else {
    foreman.hasWorkers = [worker.id];
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
  let checkin = new CheckIn(event.transaction.hash.toHex());
  checkin.farmCheckedInAt = foreman.hasFarm;
  checkin.foremanWhoChecked = foreman.id;
  checkin.workerCheckedIn = worker.id;
  // Parse date and assign
  let parsedDate = parseDate(event.params.date);
  checkin.year = parsedDate[0];
  checkin.month = parsedDate[1];
  checkin.day = parsedDate[2];

    // ╔═══════════════════════════╗
    // ║       UPDATE FARM         ║
    // ╚═══════════════════════════╝
    // - load farm.  Farm should already exist
    // - add checkin to farm's checkin array
  
  let farm = Farm.load(foreman.hasFarm);
  if(!farm){
    farm = new Farm(foreman.hasFarm);
    farm.farmCheckIns = [];
    farm.hasForemen = [];
    farm.madePayments = [];
    log.critical(
      "Worker checkedIn by foreman but farm address doesn't exist in table",
      []
    );
  }

  // finally, add the CheckIn to the worker, foreman, and farm's arrays
  if(worker.checkIns!=null){
    worker.checkIns!.push(checkin.id);
  } else {
    worker.checkIns = [checkin.id];
  }

  if(foreman.madeCheckIns!=null){
    foreman.madeCheckIns!.push(checkin.id);
  } else {
    foreman.madeCheckIns = [checkin.id];
  }

  if(farm.farmCheckIns!=null){
    farm.farmCheckIns!.push(checkin.id);
  } else {
    farm.farmCheckIns = [checkin.id];
  }

  // save all entities modified
  worker.save();
  checkin.save();
  foreman.save();
  farm.save();
}

export function handleworkerPaid(event: workerPaid): void {
    // ╔═════════════════════════════╗
    // ║       UPDATE WORKER         ║
    // ╚═════════════════════════════╝
    // - load worker.  Worker should already exist
    // - set worker daysUnpaid to 0
    // - add payment to worker's payment array
  
  let worker = Worker.load(event.params.worker.toHex()); 
  // We are assuming that a worker will never be paid before being
  // checked in, so the worker should already exist.
  if(!worker){
    worker = new Worker(event.params.worker.toHex());
    worker.daysWorked = 1;
    worker.daysUnpaid = 1;
    worker.payments = [];
    worker.hasForeman = [];
    worker.checkIns = [];
    log.critical("Worker was paid before being checked in", []);
  }
  // Worker is now paid for all their previous days unpaid
  let oldDaysUnpaid = worker.daysUnpaid;
  worker.daysUnpaid = 0;

    //  ╔═══════════════════════════╗
    //  ║       UPDATE FARM         ║
    //  ╚═══════════════════════════╝
    // - load farm.  Farm should already exist
    // - add payment to farm's payment array
  
  let farm = Farm.load(event.params.farm.toHex());
  if(!farm){
    farm = new Farm(event.params.farm.toHex());
    farm.farmCheckIns = [];
    farm.hasForemen = [];
    farm.madePayments = [];
    log.critical(
      "workerPaid event emitted but no farm with this address exists in table",
      []
    );
  }

    // ╔═════════════════════════════╗
    // ║       UPDATE PAYMENT        ║
    // ╚═════════════════════════════╝
    // - create new payment entry
    // - set year, month, day to parsed date
    // - amount = event.params.amount
    // - daysPaidFor = worker's daysUnpaid (before updating to 0)
    // - farmWhoPaid = event.params.farm
    // - workerPaid = event.params.worker
  
  let payment = new Payment(event.transaction.hash.toHex());
  payment.amount = event.params.amount;
  payment.daysPaidFor = oldDaysUnpaid;
  // Parse date and assign
  let parsedDate = parseDate(event.params.date);
  payment.year = parsedDate[0];
  payment.month = parsedDate[1];
  payment.day = parsedDate[2];
  payment.farmWhoPaid = farm.id;
  payment.workerPaid = worker.id;


  // finally, add the CheckIn to the worker and farm's arrays 
  if(worker.payments!=null){
    worker.payments!.push(payment.id);
  } else {
    worker.payments = [payment.id];
  }

  if(farm.madePayments!=null){
    farm.madePayments!.push(payment.id);
  } else {
    farm.madePayments = [payment.id];
  }

  // save entities modified
  farm.save();
  worker.save();
  payment.save();
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
