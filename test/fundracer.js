const FundRace = artifacts.require("FundRace");
const devParams = require("../dev-params");
const ERC20ABI = require("./helpers/erc20-abi");
const truffleAssert = require("truffle-assertions");
const assertRevert = truffleAssert.reverts;

contract("FundRace", accounts => {

    var instance = null;
    var token = null;

    let utils = web3.utils;
    let donation1Amount = utils.toWei('100', 'ether');

    before(async () => {
        instance = await FundRace.deployed();
        token = new web3.eth.Contract(ERC20ABI, devParams.tokenAddr);

        let stealAmount = utils.toWei('10000', 'ether');
        let stealResult = await token.methods.transfer(devParams.donor1, stealAmount).send({from: devParams.daiHolder});
        assert(stealResult.status, "Failed to steal Dai for donor");
    });

    it("should deploy with the correct initalization parameters", async () => {
        let racer1 = await instance.racer1();
        let racer2 = await instance.racer2();
        let donationToken = await instance.donationToken();

        assert.equal(racer1, devParams.racer1, "Incorrect racer1 deployed");
        assert.equal(racer2, devParams.racer2, "Incorrect racer2 deployed");
        assert.equal(donationToken, token.options.address, "Incorrect token deployed");
    });

    it("should not allow a donation designated to some other address", async () => {
        let donationPromise = instance.makeDonation(donation1Amount, devParams.otherAddr, {from: devParams.donor1});
        await assertRevert(donationPromise, "FundRace - Not Racer");
    });

    it("should fail if the donor has not approved the donation", async () => {
        let donationPromise = instance.makeDonation(donation1Amount, devParams.racer1, {from: devParams.donor1});
        await assertRevert(donationPromise);
    });

    it("should let a donor approve a transfer", async () => {
        let result = await token.methods.approve(instance.address, donation1Amount).send({from: devParams.donor1});
        assert(result.status, "Failed to approve transfer");
    });

    it("should let the donor make an approved, designated donation", async () => {
        await instance.makeDonation(donation1Amount, devParams.racer1, {from: devParams.donor1});
        let contractBalance = await token.methods.balanceOf(instance.address).call();
        assert.equal(contractBalance, donation1Amount, "Failed to tranfer donation to contract");
    });
});
