// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/access/Ownable.sol";

// By default the owner is the address that deploys the contract.
contract ElSalvadorCoffee is Ownable {

    event newWorker(address wallet, string name, string region);
    event newPayment(address wallet, string name, string region, uint amountPaid);

    // Constant of how much to pay workers per day.
    uint payPerDay = 0.0001 ether;

    // TODO: convert to an NFT.
    // Worker struct that describes each worker on the farm.
    struct Worker {
        address wallet;         // Address of the workers wallet
        string name;            // Name of the worker
        string region;          // Region that the worker works in
        uint8 unpaidWorkDays;   // Days that the worker is to be paid for
        uint balance;           // Total amount that the worker has been paid
    }   

    // Array for holding all workers.
    // Public because for this project we want complete transparency
    // of the supply chain.
    Worker[] public workers;

    // Returns the Worker given the address.
    // Set an address to a worker: addressToWorker[bobAddress] = bobWorker;
    // Get a worker from address: Worker bobWorker = addressToWorker[bobAdress];
    // Only need to use this in a situation where we would normally 
    // search through the whole workers array for a specific worker 
    // based on their address.
    mapping (address=>Worker) public addressToWorker;


    // Function to create a new worker and add it to the list of current workers.
    // TODO: currently only callable by workers but might want to make it onlyOwner.
    function createNewWorker(string memory _name, string memory _region) public {

        // The default value for address is address(0), so to check that a worker
        // doesn't exist, we check to see if their address is address[0].
        require(addressToWorker[msg.sender].wallet == address(0));

        // Creates a new worker and adds it to the workers array.
        // Sets address to the address of whoever called the function.
        // Sets name and region to the arguments passed to createNewWorker function.
        // Sets unpaidWorkDays and balance to 0.
        Worker memory _newWorker = Worker(msg.sender, _name, _region, 0, 0);

        // Adds a new worker to the array of all workers.
        workers.push(_newWorker);

        // Ties the worker to an address by adding it to the mapping.
        // This way we can be given just an address and return it's worker object.
        // ex: Worker bobWorker = addressToWorker[bobsAdress];
        addressToWorker[msg.sender] = _newWorker;

        emit newWorker(msg.sender, _name, _region);
    }


    // Add a day worked depending on the workerId.
    // Is only callable by the owner of the contract.
    function addDayWorked (uint _workerId) public onlyOwner {
        workers[_workerId].unpaidWorkDays++;
    }


    // Pay a single worker.
    // Is only callable by the owner of the contract.
    // Must be called with an amount of funds sufficient to pay the worker's salary.
    function paySingleWorker(uint _workerId) public payable onlyOwner {
        uint amountPaid = payWorker(_workerId, msg.value);

        // Returns any extra funds that msg.sender sent to function call 
        // after all workers are paid.
        // Best practice for paying is binding the payout to a boolean and 
        // requiring that it is successful.
        // TODO: might run into issues depending on gas fees.  Figure out
        // how transaction costs might effect this.
        bool returnAmount = payable(msg.sender).send(msg.value - amountPaid);
        require(returnAmount, "Failed to return extra funds after paying worker.");
    }


    // Pay all of the workers.
    // Is only callable by the owner of the contract.
    // Must be called with an amount of funds sufficient to pay ALL the workers' salaries.
    function payAllWorkers () public payable onlyOwner {

        // Holds the balance of the function.  Starts at msg.value and
        // gets reduced by the amount paid to each worker.
        uint functionBalance = msg.value;

        // Holds the total amount paid out to workers throughout
        // this function.
        uint totalPaid;

        // Iterates through the array of all workers and pays each of them
        // by calling payWorker().
        for (uint i = 0; i < workers.length; i++) {

            // Calls payWorker function with the current worker ID and the
            // amount left from msg.value as functionBalance.
            uint amountPaid = payWorker(i, functionBalance);

            // Decreased functionBalance by the amount paid to the worker.
            functionBalance -= amountPaid;

            // Increases totalPaid by the amount paid to the worker.
            totalPaid += amountPaid;
        }

        // Returns any extra funds that msg.sender sent to function call 
        // after all workers are paid.
        // Best practice for paying out of contract is binding the
        // payout to a boolean and requiring that it is successful.
        // TODO: might run into issues depending on gas fees.  Figure out
        // how transaction costs might effect this.
        bool returnAmount = payable(msg.sender).send(functionBalance);
        require(returnAmount, "Failed to return extra funds after paying workers.");
    }


    // Helper function to pay a worker at a time based on their workerId.
    // Is called in payAllWorkers() and paySingleWorker().
    // Returns the amount that was paid to the worker.
    function payWorker (uint _workerId, uint msgValue) internal returns(uint) {

        // Gets the unpaidWorkDays from the worker struct and then resets it
        // to 0.
        uint daysWorked = workers[_workerId].unpaidWorkDays;

        // Calculates pay earned (amount that the worker will be paid).
        uint payEarned = daysWorked*payPerDay;

        // Checks that the function was called with enough funds
        // to pay the worker.
        require((msgValue > payEarned), "Insufficient funds to pay worker.");

        address workerAddress = workers[_workerId].wallet;

        // Payout is triggered and funds are paid to the worker.
        // Best practice for paying out of contract is binding the
        // payout to a boolean and requiring that it is successful.
        bool sent = payable(workerAddress).send(payEarned);
        require(sent, "Failed to pay worker"); 

        // Updates the amount the worker had been paid for public visibility.
        workers[_workerId].balance += payEarned;

        // Sets unpaidWorkDays to 0 after the worker is successfully paid.
        workers[_workerId].unpaidWorkDays = 0;

        // Emits event to frontend to indicate that worker was paid.
        emit newPayment(msg.sender, workers[_workerId].name, workers[_workerId].region, payEarned);

        // returns the amount that was paid to the worker.
        return payEarned;
    }

}