# Verifying Coffee Laborers In El Salvador are being paid a fair wage
This is the backend repository for the 2022 Lehigh University capstone team sponsored by ChainBytes.  This Capstone team consists of Joss Duff, Hudson Pavia, Kenny Cho, and Justin Venezia.  

We divided the project into frontend and backend repositories.  The backend was led by Joss and Hudson while the frontend was led by Kenny and Justin.

Our backend is built using Hardhat to set up a smart contract development environment.  It also includes our subgraph we built to allow the frontend to query for on-chain events.

# Hardhat
See a list of Hardhat commands with 

`$ npx hardhat`
## Deploy smart contract
First, set up .env like .sample-env, then

`$ npx hardhat run --network goerli scripts/deploy-coffee.js`

(optional) Verify on etherscan so you can read/write contract and see events
Paste given verify line from output of above script

ex:

`$ npx hardhat verify --network goerli 0xdBfE99f836C95f2470adA8980D8ae01b33bD10A1`

## Important files
`hardhat.config.js`
* Heart of your hardhat setup
* Configure solidity versions, ethereum networks, load .env values, import hardhat plugins

`test/coffee-test.js`
* Tests for coffee.sol contract 
* Written with JavaScript and the help of Chai assertion library and hardhat-waffle plugin
* Run command in ChainBytes folder
    `$ npx hardhat test`

`scripts/deploy-coffee.js`
* Script to deploy coffee.sol
* See above section on deploying

`contracts/coffee.sol`
* Our solidity file that this hardhat revolves around
* Compile 
  `$ npx hardhat compile`
* Compiling creates the `artifacts` folder.  Think of it like a build folder
* Clean `artifacts` folder if you want to force a compile.  If hardhat doesn’t detect any contract changes it doesn’t reattempt compiling when you command it.  Sometimes hardhat is wrong and sometimes you need to remove old artifacts.
`$ npx hardhat clean`

# Our Smart Contract: coffee.sol
OUR GOAL: to make sure that coffee laborers in El Salvador are being paid a fair wage using blockchain technology.  We're using a blockchain because blockchains are irrefutable.  When a transaction is on chain, nobody can refute the transaction.  So what functionality do we need to be irrefutable (on chain) to accomplish our goal?  The payment of workers is one function that needs to be irrefutable.  Also, we need a function to indicate that a worker did indeed work each day so the public can compare the amount of days they worked to the amount they were paid.  Foremen handle checking in workers each day and farms handle the paying of wages to workers.  This is the core functionality of our minimum viable product.  We wrote this contract to accomplish just our MVP.
    
'farms' and 'foremen' in this contract are treated like a role for access control purposes. Only addresses that are farms should be allowed to pay workers and assign addresses to foremen roles. Only addresses that are foremen should be allowed to check in workers.

This contract handles farms, foremen, and workers all as individual addresses and not large structs with multiple parameters. 

For paying workers and checking in we will leverage theGraph.

We want to be able to keep track of which days the worker checked in, and which days they're paid for.  This is difficult and expensive to do on chain.  We can solve this by handling payment history and worker/foreman/farm association in a subgraph, which is okay to do because our goal in this project is simply irrefutably showing that the worker got paid.  If someone wants to check which days a worker checked in, on the front end we can return a list of all emitted workerCheckedIn and workerPaid events for that address by querying our subgraph.

For associating workers to foremen, this can also be handled in our subgraph because we have no need to get a list of all workers for a foreman in this contract.  When the event workerCheckedIn(address foreman, address worker, string date) is called, the subgraph can add the worker to an array of addresses for a worker.  If someone wanted to verify this, they could simple query our subgraph for all workers associated with a foreman.

## Events
```
    event newFarm(address farmAddress);
    event newForeman(address farmAddress, address foreman);
    event workerCheckedIn(address foreman, address[] worker, string date);
    event workerPaid(address farm, address[] worker, uint[] amount, string date);
```

## Custom Errors
Custom Solidity errors instead of require statement strings saves gas on deploy.
```
   error AddressNotFarm();
   error AddressNotForeman();
   error WorkersAmountsMismatch();
   error WrongPaymentAmount();
   error PaymentFailed();
   error SendBackFailed();
```

## Mappings
For assigning addresses to roles (farm or foreman).
```
mapping(address => bool) public isFarm;
mapping(address => bool) public isForeman;
```

## Functions
Signatures and the event they emit.
Check out `contracts/coffee.sol` for detailed explanation of all functions.
```
function createFarm(address _farmAddress) external onlyOwner {
  emit newFarm(_farmAddress);
}
 
function createForeman(address _foremanAddress) external onlyFarm {
  emit newForeman(msg.sender, _foremanAddress);
}
 
function payWorkers(address[] calldata _workers, uint[] calldata _amounts, string calldata _date external payable onlyFarm {
  emit workerPaid(msg.sender, _workers, _amounts, _date);
}
 
function checkIn(address[] calldata _workers, string calldata _date) external onlyForeman {
  emit workerCheckedIn(msg.sender, _workers, _date);
}
```

# Smart Contract Hardhat tests
Run all tests in the tests folder:
`$ npx hardhat test`

The life-cycle for developing and testing in a Hardhat environment is incredibly straightforward:

* Make changes to .sol files in contracts folder
* `$ npx hardhat compile` to validate your contract changes
* Create test files in the tests folder that call functions in your contracts and make assertions about the expected outcome/results
* `$ npx hardhat test`  - to have Hardhat “deploy” your contracts to their testing environment and run your tests against your contracts
* Observe the outcome of the tests and repeat steps 1-4

For our team, we used the Chai Assertion library in combination with the Mocha framework for writing javascript tests. There are many comments in the existing tests that explain most of what you’ll need to know.

Chai - https://www.chaijs.com

Mocha - https://mochajs.org

Hardhat - https://hardhat.org


# Subgraph (coffee-subgraph)
Currently deployed to theGraph's Hosted Service at https://thegraph.com/hosted-service/subgraph/jossduff/coffee-subgraph

## Deploying
Run all commands in order in the `coffee-subgraph` folder
* After making changes to schema.graphql
  * `$ graph codegen`
  * Generates AssemblyScript types for a subgraph
* After making changes to handlers in `src/coffee.ts`
  * `$ graph build`
  * Builds a subgraph and (optionally) uploads it to IPFS
  * Creates contents of build folder which is used in deployment
* To deploy to hosted service/subgraph studio
  * `$ graph deploy jossduff/coffee-subgraph subgraph.yaml`
  * Select “Hosted Service”
  * Deploys the subgraph to a Graph node
  * Go to above “deployed subgraph” link and wait for it to sync (10-20 mins)

## Important Files
`schema.graphql`
* Where we define our tables based on below diagram
![Schema diagram](https://github.com/JossDuff/ChainBytes/blob/master/schema.png)

`src/coffee.ts`
* Event handlers
* Here you write the logic of how you want theGraph to parse data emitted in events into your tables defined in schema.graphql
* This is where errors are most likely to occur

`tests/coffee.test.ts`
* Tests for event handlers

`networks.json`
* Specify network and address of the contract whose events you want to index
* Change address/network if you want to index a different contract
  * Also change in subgraph.yaml

`subgraph.yaml`
* Subgraph manifest
* Heart of the subgraph
* Contains info on contract deployment, contract abi, table entities (defined in schema.graphql), and contract events associated with handlers

## Debugging the Subgraph
To query Subgraph Health (This will retrieve the error message for failed subgraphs)
* Find your Deployment ID ("Qm....")
* Go to https://graphiql-online.com/
* Enter API https://api.thegraph.com/index-node/graphql
* Run this query:
```
{
  indexingStatuses(subgraphs: ["Qm..."]) {
    subgraph
    synced
    health
    entityCount
    fatalError {
      handler
      message
      deterministic
      block {
        hash
        number
      }
    }
    chains {
      chainHeadBlock {
        number
      }
      earliestBlock {
        number
      }
      latestBlock {
        number
      }
    }
  }
}

```






