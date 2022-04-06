// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/access/Ownable.sol";


/*

    OUR GOAL: to make sure that coffee laborers in El Salvador are being paid a fare
    wage using blockchain technology.  We're using a blockchain because blockchains are 
    irrefutable.  When a transaciton is on chain, nobody can refute the transaction.  
    So what functionality do we need to be irrefutable to accomplish our goal?  Obviously,
    the payment of workers is one function that needs to be irrefutable.  Also, we need 
    a function to indicate that a worker did indeed work each day so the public can 
    compare the amount of days they worked to the amount they were paid.  Foremen handle 
    checking in workers each day and farms handle the paying of wages to workers.  This is the
    core functionality of our minimum viable product.  I wrote this contract to accomplish
    just our MVP.
    
    'farms' and 'foremen' in this contract are treated like a role for access control purposes.
    Only addresses that are farms should be allowed to pay workers and assign addresses to foremen roles.
    Only addresses that are foremen should be allowed to check in workers.

    This contract handles farms, foremen, and workers all as individual addresses
    and not large structs with multiple parameters.  Associating a farm or foreman
    with a region or a name can be handled by the frontend at the time of the farm
    or foreman creation (indicated by the events that are emitted) assuming that 
    these functions are also only being called by the frontend.  Frontend should 
    also handle querying of data because this isn't needed in this contract.

    TEAM DISCUSSION QUESTION:
        Why do we need a foreman to be associated with a farm in contract?  
            As far as I can see, there isn't a need to get the farm when given a foreman in this MVP
            contract.  Which foremen work at which farm isn't an issue that we're trying to solve
            irrefutably, so can't this association just be handled by the frontend when an event is emitted?
        

*/
contract coffee is Ownable{

    event newFarm(address farmAddress);
    event newForeman(address farmAddress, address foreman);
    event workerCheckedIn(address foreman, address worker, string date);
    event workerPaid(address farm, address worker, uint amount);

    // Modifier to add to functions that only a farm address can call.
    // Checks isFarm to see if that address is mapped to 'true', indicating
    // that it is a farm.
    // If the address is mapped to a false value (the address isn't a farm)
    // the caller won't be able to use the function with this 'onlyFarm'
    // modifier attatched.
    modifier onlyFarm {
        require(isFarm[msg.sender]);
        _;
    }

    // Modifier to add to functions that only foremen can call.
    // Checks isForemen function to see if the address is mapped to 'true',
    // indicating that it is a foreman.
    // If the address is mapped to a false value (the address isn't a foreman)
    // the caller won't be able to use the function with this 'onlyForeman'
    // modifier attatched.   
    modifier onlyForeman {
        require(isForeman[msg.sender]);
        _;
    }

    // Mapping to indicate if an address is a farm.
    // Can use this to verify an address is a farm.
    // 'bool' starts as false by default, and is set to true
    // in the newFarm function. 
    mapping(address => bool) isFarm;

    // Only the owner (admin) can call this function to create a new farm.
    // TODO: maybe any address should be able to call this to create their
    // own farm.
    function createFarm(address _farmAddress) public onlyOwner {
        // Adds the _farmAddress to the mapping and sets boolean as true,
        // indicating that this address is a farm.
        isFarm[_farmAddress] = true;

        emit newFarm(_farmAddress);
    }

    // Returns true if the _maybeFarm address is a farm, false otherwise.
    function isAddressFarm(address _maybeFarm) public view returns(bool){
        return isFarm[_maybeFarm];
    }

/*
    This block handles the mapping that associates a farm to a foreman but I'm commenting 
    it out for now because I no longer belive we need that association in contract.

    struct maybeForeman {
        address owner;
        bool isForeman;
    }

    // Double mapping for address (farm) => address (forman) => bool (isForeman).
    // It's really a mapping of farm addresses to the space of all addresses
    // with a flag (bool isForeman) indicating this address is a foreman at 
    // the farm.
    // This way we can associate a foreman's address with a farm.
    mapping(address => maybeForeman[]) farmForemen;
*/


    // Mapping for verifying an address is a foreman.
    // Used in onlyForeman modifier.
    mapping(address => bool) isForeman;

    // Is to be called by a farm address to create a new foreman for that farm.
    // 'address _foremanAddress' is the address of the foreman to be added to the farm.
    function createForeman(address _foremanAddress) public onlyFarm {

/*
        This block handles the mapping that associates a farm to a foreman but I'm commenting 
        it out for now because I no longer belive we need that association in contract.

        // Creates a new maybeForeman struct with the foreman's address and sets
        // 'isForeman' to true, indicating that this address is a foreman.
        maybeForeman memory _newForeman = maybeForeman(_foremanAddress, true);

        // Adds the new foreman address to the mapping of farm's foremen.
        // msg.sender is the farm calling this function who wants a new foreman.
        farmForemen[msg.sender].push(_newForeman);
*/

        // Additionally sets the isForeman mapping to true.
        isForeman[_foremanAddress] = true;

        // Emits event to frontend with the farm address and the foreman address.
        // The frontend should save this association.
        emit newForeman(msg.sender, _foremanAddress);
    }

    // Returns true if address is a foreman, false otherwise.
    function isAddressForeman(address _maybeForeman) public view returns(bool){
        return isForeman[_maybeForeman];
    }


/*

    Paying workers and checking in.

    We have the issue of wanting to be able to keep track of which days the worker
    checked in, and which days they're paid for.  This is difficult and expensive 
    to do on chain.  I think we can solve this by handling most of it off chain which
    is okay to do because our goal in this project is simply irrefutably showing that the 
    worker got paid.  If somone wants to check which days a worker checked in, on the front
    end we can return a list of all emitted workerCheckedIn events for that address.  
    This verifier can then compare it to the list of all emitted workerPaid events (also 
    returned by front end) to makes sure it matches up correctly.

    For associating workers to foremen, this can also be handled in the frontend for now because
    we have no need to get a list of all workers for a foreman yet in this contract.  When the
    event workerCheckedIn(address foreman, address worker, string date) is called, the frontend
    can add the worker to an array of addresses for a worker.

*/


    // The frontend will call this function with the address of each worker
    // to pay and also the amount of days to pay them for.
    // Amount of days to pay them for is calculated in frontend.
    // Update the dates that the worker was paid for in the frontend.
    function payWorker(address _worker) public payable onlyFarm {
        // Pays the worker and requires that it was successful,
        // otherwise it failed and the payment doesn't go through
        bool success = payable(_worker).send(msg.value);
        require(success, "Worker payment failed");

        // msg.sender is the farm paying the worker
        emit workerPaid(msg.sender, _worker, msg.value);
    }


    // Foreman calls checkIn with the worker address and the date.  The date is determined by the frontend.
    // Sends the date to frontend, so the frontend can handle sorting which days the worker worked for,
    // and which days the worker is unpaid for.
    // TODO: what if a foreman forgets to check in workers on a certain date and they want to go back and
    // check them in later?
    // TODO: if the foreman can't be trusted with setting the proper date, then we can have a setDate
    // function that is only callable by the farm, and then in this function we make a call to a 
    // getDate function to return the date.
    function checkIn(address _workerAddress, string memory _date) public onlyForeman {
        // We can handle the association between the worker and foreman in the frontend.
        // This function accomplishes the goal of foremen indicating that a worker
        // worked on a particular day as only a foreman can call this function.
        
        emit workerCheckedIn(msg.sender, _workerAddress, _date);
    }
    
}