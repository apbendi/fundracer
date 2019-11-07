const FundRace = artifacts.require("FundRace");
const generateParams = require("../dev-params")(undefined, "fundracer.js");
const ERC20ABI = require("./helpers/erc20-abi");
const truffleAssert = require("truffle-assertions");
const assertRevert = truffleAssert.reverts;
const assertEmitted = truffleAssert.eventEmitted;
const timeHelpers = require("./helpers/time-helpers")(web3);

async function divestHoldings(token, sender, receiver) {
    let balance = await token.methods.balanceOf(sender).call();

    if ("0" === balance.toString(10)) {
        return;
    }

    let result = await token.methods.transfer(receiver, balance).send({from: sender});
    assert(result.status, "Failed to divest holdings");
}

contract("FundRace", accounts => {

    var instance = null;
    var token = null;
    var devParams = null;

    let utils = web3.utils;
    let donation1Amount = utils.toWei('100', 'ether');
    let donation2Amount = utils.toWei('80', 'ether');
    let totalDonation = utils.toWei('180', 'ether');
    let winnerTake = utils.toWei('144', 'ether');
    let loserTake = utils.toWei('36', 'ether');

    before(async () => {
        devParams = await generateParams();

        instance = await FundRace.deployed();
        token = new web3.eth.Contract(ERC20ABI, devParams.tokenAddr);

        let stealAmount = utils.toWei('10000', 'ether');

        // Reset state from previous tests on this long-lived local fork chain
        await divestHoldings(token, devParams.racer1, devParams.daiHolder);
        await divestHoldings(token, devParams.racer2, devParams.daiHolder);

        // Steal some Dai from a large whale
        let stealResult1 = await token.methods.transfer(devParams.donor1, stealAmount).send({from: devParams.daiHolder});
        assert(stealResult1.status, "Failed to steal Dai for donor");
        let stealResult2 = await token.methods.transfer(devParams.donor2, stealAmount).send({from: devParams.daiHolder});
        assert(stealResult2.status, "Failed to steal Dai for donor");
    });

    it("should deploy with the correct initalization parameters", async () => {
        let racer1 = await instance.racer1();
        let racer2 = await instance.racer2();
        let endDate = await instance.endDate();
        let donationToken = await instance.donationToken();

        assert.equal(racer1, devParams.racer1, "Incorrect racer1 deployed");
        assert.equal(racer2, devParams.racer2, "Incorrect racer2 deployed");
        assert.equal(endDate, devParams.endDate, "Incorrect end date deployed");
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
        let result = await instance.makeDonation(donation1Amount, devParams.racer1, {from: devParams.donor1});

        assertEmitted(result, 'Donation', (event) => {
            return event.donor === devParams.donor1 &&
                    event.racer === devParams.racer1 &&
                    event.amount.toString(10) === donation1Amount;
        }, "Failed to emit Donation event");

        let contractBalance = await token.methods.balanceOf(instance.address).call();
        assert.equal(contractBalance, donation1Amount, "Failed to tranfer donation to contract");
    });

    it("should reflect the correct designations for each racer", async () => {
        let {racer1Designations, racer2Designations} = await instance.getDesignations();

        assert.equal(racer1Designations, donation1Amount, "Invalid racer1 balance");
        assert.equal(racer2Designations, 0, "Invalid racer2 balance");
    });

    it("should let another donor approve and make a donation", async () => {
        let approveResult = await token.methods.approve(instance.address, donation2Amount).send({from: devParams.donor2});
        assert(approveResult.status, "Failed to approve transfer");

        let donationResult = await instance.makeDonation(donation2Amount, devParams.racer2, {from: devParams.donor2});

        assertEmitted(donationResult, 'Donation', (event) => {
            return event.donor === devParams.donor2 &&
                    event.racer === devParams.racer2 &&
                    event.amount.toString(10) === donation2Amount;
        }, "Failed to emit Donation event");

        let contractBalance = await token.methods.balanceOf(instance.address).call();
        assert.equal(contractBalance, totalDonation, "Failed to tranfer donation to contract");

        let {racer1Designations, racer2Designations} = await instance.getDesignations();

        assert.equal(racer1Designations, donation1Amount, "Invalid racer1 balance");
        assert.equal(racer2Designations, donation2Amount, "Invalid racer2 balance");
    });

    it("should not let the loser withdraw before the end date", async () => {
        let withdrawPromise = instance.withdrawWinnings({from: devParams.racer2});
        await assertRevert(withdrawPromise, "FundRace - Has Not Ended");
    });

    it("should not let the winner withdraw before the end date", async () => {
        let withdrawPromise = instance.withdrawWinnings({from: devParams.racer1});
        await assertRevert(withdrawPromise, "FundRace - Has Not Ended");
    });

    it("should jump the test chain past the end date", async () => {
        await timeHelpers.jumpToTime(devParams.endDate + 10);
    });

    it("should not allow further donations after the end date", async () => {
        let approveResult = await token.methods.approve(instance.address, donation2Amount).send({from: devParams.donor2});
        assert(approveResult.status, "Failed to approve transfer");

        let donationPromise = instance.makeDonation(donation2Amount, devParams.racer2, {from: devParams.donor2});

        await assertRevert(donationPromise, "FundRace - Past End Date");
    });

    it("should allow the loser to extract their take", async () => {
        await instance.withdrawWinnings({from: devParams.racer2});

        let racerBalance = await token.methods.balanceOf(devParams.racer2).call();

        assert.equal(racerBalance, loserTake, "Failed to transfer balance to loser");
    });

    it("should not allow the loser to extract their take a second time", async () => {
        let withdrawPromise = instance.withdrawWinnings({from: devParams.racer2});
        await assertRevert(withdrawPromise, "FundRace - Already Withdrawn");
    });

    it("should allow the winner to extract their take", async () => {
        await instance.withdrawWinnings({from: devParams.racer1});

        let racerBalance = await token.methods.balanceOf(devParams.racer1).call();

        assert.equal(racerBalance, winnerTake, "Failed to transfer balance to winner");
    });
});
