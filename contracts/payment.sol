// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "./foremanFactory.sol";

contract payment is foremanFactory {
  
  event paidWorker(address worker);
  
  // Maps the worker's address to the block number that they were last paid at
  mapping (address => uint) internal workerLastBlockNumber;

  function payWorker(address worker) external payable{
    //joss inspired, bind payment to boolean send
    bool sent = payable(worker).send(msg.value);
    //require sent is true
    require(sent, "Worker payment failed");
    //update workerLastBlockNumber
    workerLastBlockNumber[worker] = block.number;
    //emit event so in the front end we can display a nice message
    //to let person know they successfully paid a worker
    emit paidWorker(worker);
  }
}