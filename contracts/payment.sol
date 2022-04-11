// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "./farmFactory.sol";

contract payment is farmFactory {
  
  event paidWorker(address worker);

  function payWorker(address worker) external payable{
    bool sent = payable(worker).send(msg.value);
    //require sent is true

    require(sent, "Worker payment failed");

    emit paidWorker(worker);
  }
}