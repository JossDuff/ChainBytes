// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "./farmFactory.sol";

contract payment is farmFactory {
  
  event paidWorker(address worker);

  // pay a worker a specfic, explicit value
  function payWorkerSpecific(address worker) external payable{
    bool sent = payable(worker).send(msg.value);
    require(sent, "Worker payment failed");
    emit paidWorker(worker);
  }

  // Count up how many times this worker has checked in without getting paid
  // Pay worker for the time that they worked, and update lastDatePaid
  function payWorker(address worker) external payable{
    bytes memory checkIn;
    uint daysUnpaid;
    for(uint i = 0; i < foremen.length; i++){
      if((checkIn = bytes(foremen[i].checkInTime(worker))).length > 1){
        
      }
    }
    bool sent = payable(worker).send(msg.value);
    require(sent, "Worker payment failed");
    emit paidWorker(worker);
  }
}