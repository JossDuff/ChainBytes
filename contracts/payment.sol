// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "./farmFactory.sol";

// Interface to declare functions that will allow us to access foreman mappings
interface foremanGateway {
  function getUnpaidWorkDays(address _worker) external view returns (string[] memory);
  function addUnpaidWorkDay(address _worker, string memory newWorkDay) external;
  function clearUnpaidWorkDays(address _worker) external;
  function getWorkHistory(address _worker) external view returns (string[] memory);
  function setWorkHistory(address _worker, string memory newWorkDay) external;
}

contract payment is  farmFactory{

  event paidWorker(address worker);

  // pay a worker a specfic, explicit value
  function payWorkerSpecific(address worker) external payable{
    //pay the worker with the value of the transaction
    bool sent = payable(worker).send(msg.value);
    require(sent, "Worker payment failed");
    //now that we know the payment went through,
    // we can itterate through the array of foreman and check to see if they have unpaid work days outstanding
    //if they do, we will call the function adjustWorkerHistory which transfers unpaid work days to work history and clears unpaid days
    foremanGateway thisForeman;
    for (uint i = 0; i < foremen.length; i++){
      foremanRole fr = foremen[i];
      thisForeman = foremanGateway(address(fr));
      if (thisForeman.getUnpaidWorkDays(worker).length > 0) {
        adjustWorkerHistory(fr, worker);
      }
    }
    //now we will take care of the arrays

    emit paidWorker(worker);
  }

  // Count up how many times this worker has checked in without getting paid
  function queryWorkerDaysUnpaid(address _worker) external view returns (uint){
    uint daysUnpaid;
    foremanGateway thisForeman;
    //memory array to hold the index of the foreman that the workers had unpaid days with
    for(uint i = 0; i < foremen.length; i++){
      //check to see if this worker has any unpaid days logged with this foreman
      foremanRole fr = foremen[i];
      thisForeman = foremanGateway(address(fr));
      daysUnpaid += thisForeman.getUnpaidWorkDays(_worker).length;
    }
    return daysUnpaid;
  }

  //function to call when paying a worker
  // maintains the mappings unpaidWorkDays and workHistory
  function adjustWorkerHistory(foremanRole fr, address _worker) internal {
    //adds the information in unpaidWorkDays to workHistory
    //then sets unpaidWorkDays[_worker] = new string[](0);
    foremanGateway thisForeman = foremanGateway(address(fr));
    string[] memory unpaidDays = thisForeman.getUnpaidWorkDays(_worker);
    for (uint i = 0; i < unpaidDays.length; i++){
      string memory day = unpaidDays[i];
      thisForeman.setWorkHistory(_worker, day);
    }
    //now reset that workers unpaid array
    thisForeman.clearUnpaidWorkDays(_worker);
  }
}