const {expect} = require("chai");
const { ethers } = require("hardhat");
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace");

describe("farmFactory contract", function() {

    let owner;

    // 'beforeEach' will run before each test, re-deploying the contract
    // every time.
    beforeEach(async function () {
        farmFactory = await ethers.getContractFactory("farmFactory");
        [owner] = await ethers.getSigners();

        // To deploy contract.
        hardhatFarmFactory = await farmFactory.deploy();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await hardhatFarmFactory.owner()).to.equal(owner.address);
        });
    });

    describe("Farm creation", function() {
        it("Should create a farm struct", async function(){
            await hardhatFarmFactory.createFarm("ChainBytes Coffee Farm", "Pennsylvania");
            
            const newFarmName = await hardhatFarmFactory.getFarmName(0);
            expect(newFarmName).to.equal("ChainBytes Coffee Farm");
        });
    });

    
});

describe("foremanFactory contract", function() {

    let owner;
    let addr1;
    let addr2;
    let addr3;

    // 'beforeEach' will run before each test, re-deploying the contract
    // every time.
    beforeEach(async function () {
        foremanFactory = await ethers.getContractFactory("foremanFactory");
        [owner, addr1, addr2, addr3] = await ethers.getSigners();

        // To deploy contract.
        hardhatForemanFactory = await foremanFactory.deploy();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await hardhatForemanFactory.owner()).to.equal(owner.address);
        });
    });
    describe("Foreman creation", function () {
        it("Should create a foreman struct", async function() {
            await hardhatForemanFactory.createForeman("Pennsylvania", addr1.address);

            const newForemanRegion = await hardhatForemanFactory.getForemanRegion(0);
            expect(newForemanRegion).to.equal("Pennsylvania");
        });
    });
});

/*
describe("payments contract", function() {

    let owner;
    let addr1;
    let addr2;
    let addr3;

    // 'beforeEach' will run before each test, re-deploying the contract
    // every time.
    beforeEach(async function () {
        payment = await ethers.getContractFactory("payment");
        [owner, addr1, addr2, addr3] = await ethers.getSigners();

        // To deploy contract.
        hardhatPayment = await payment.deploy();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await hardhatPayment.owner()).to.equal(owner.address);
        });
    });
    describe("Paying worker", function () {
        it("Should pay the worker", async function() {
            await hardhatForemanFactory.createForeman("Pennsylvania", addr1.address);

            const newForemanRegion = await hardhatForemanFactory.getForemanRegion(0);
            expect(newForemanRegion).to.equal("Pennsylvania");
        });
    });
});
*/