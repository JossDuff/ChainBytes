const {expect} = require("chai");
const { ethers } = require("hardhat");
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace");

describe("coffee contract", function() {
    let owner;
    let addr1;
    let addr2;
    let addr3;

    beforeEach(async function () {
        coffee = await ethers.getContractFactory("coffee");
        [owner, addr1, addr2, addr3] = await ethers.getSigners();

        // Deploys contract
        hardhatCoffee = await coffee.deploy();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await hardhatCoffee.owner()).to.equal(owner.address);
        });
    });

    describe("Farm creation", function() {
        it("Should assign an address as a farm", async function() {
            await hardhatCoffee.createFarm(addr1.address);
            const isFarm = await hardhatCoffee.isAddressFarm(addr1.address);

            expect(isFarm).to.equal(true);
        });
        
    });

    describe("Foreman creation", function() {
        it("Should assign an address as a foreman", async function() {
            // Sets addr1 as a farm
            await hardhatCoffee.createFarm(addr1.address);
            
            // The farm (addr1) sets addr2 as a foreman
            await hardhatCoffee.connect(addr1).createForeman(addr2.address);

            const isForeman = await hardhatCoffee.isAddressForeman(addr2.address);
            expect(isForeman).to.equal(true);
        });

    });
});