// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "./farmFactory.sol";

contract payment is  farmFactory{
  
  event paidWorker(address worker);

  // pay a worker a specfic, explicit value
  function payWorkerSpecific(address worker) external payable{
    bool sent = payable(worker).send(msg.value);
    require(sent, "Worker payment failed");
    //now we will take care of the arrays

    emit paidWorker(worker);
  }

  // Count up how many times this worker has checked in without getting paid
  // Pay worker for the time that they worked, and update lastDatePaid
  function queryWorkerDaysUnpaid(address worker) external returns (uint){
    uint daysUnpaid;
    //memory array to hold the index of the foreman that the workers had unpaid days with
    for(uint i = 0; i < foremen.length; i++){
      //check to see if this worker has any unpaid days logged with this foreman
      foremanRole fr = foremen[i];
      daysUnpaid += unpaidWorkDaysWith(fr, worker);
    }
    return daysUnpaid;
  }
  //function to call when paying a worker
  // maintains the mappings unpaidWorkDays and workHistory
  function adjustWorkerHistory(foremanRole fr, address _worker) internal {
    //adds the information in unpaidWorkDays to workHistory
    //then sets unpaidWorkDays[_worker] = new string[](0);
    uint size = fr.unpaidWorkDays(_worker).length;
    for (uint i = 0; i < size; i++){
      string memory day = fr.unpaidWorkDays(_worker)[i];
      fr.workHistory(_worker).push(day);
    }
    //now reset that workers unpaid array
    fr.unpaidWorkDays[_worker] = new string[](0);
  }
  //return unpaid workdays between this foreman and worker
  function unpaidWorkDaysWith(foremanRole fr, address _worker) internal  returns (uint){
    return fr.unpaidWorkDays(_worker).length;
  }
}