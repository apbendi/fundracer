const FundRace = artifacts.require("FundRace");

function weiify(amount) {
    return web3.utils.toWei(amount.toString());
}

function assertWeiEqualAmount(wei, expected, failMsg = "Unexpected Amount") {
    assert.equal(wei.toString(10), weiify(expected).toString(10), failMsg);
}

contract("FundRace Splits", _accounts => {

    var instance = null;

    before(async () => {
        instance = await FundRace.deployed();
        assert(instance.address.startsWith("0x"), "Deployed Contract Not Found");
    });

    it("should return zeros when zero designations made", async () => {
        let zero = weiify(0);
        let {racer1Take, racer2Take} = await instance.calculateSplits(zero, zero);

        assert.equal(racer1Take.toString(10), "0", "Unexpected Racer1 Take");
        assert.equal(racer2Take.toString(10), "0", "Unexpected Racer2 Take");
    });

    it("should return an 80/20 split when the designations were 80/20", async () => {
        let {racer1Take, racer2Take} = await instance.calculateSplits(weiify(80), weiify(20));

        assertWeiEqualAmount(racer1Take, 80);
        assertWeiEqualAmount(racer2Take, 20);
    });

    it("should return an 20/80 split when the designations were 20/80", async () => {
        let {racer1Take, racer2Take} = await instance.calculateSplits(weiify(20), weiify(80));

        assertWeiEqualAmount(racer1Take, 20);
        assertWeiEqualAmount(racer2Take, 80);
    });
});