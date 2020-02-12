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

    it("should return a 50/50 split when there is an exact tie", async () => {
        let {racer1Take, racer2Take} = await instance.calculateSplits(weiify(50), weiify(50));

        assertWeiEqualAmount(racer1Take, 50);
        assertWeiEqualAmount(racer2Take, 50);
        assert.equal(racer1Take.toString(10), racer2Take.toString(10), "50/50 split not equal");
    });

    it("should return an 80/20 split when the designations were 80/20", async () => {
        let {racer1Take, racer2Take} = await instance.calculateSplits(weiify(80), weiify(20));

        assertWeiEqualAmount(racer1Take, 80);
        assertWeiEqualAmount(racer2Take, 20);
    });

    it("should return a 20/80 split when the designations were 20/80", async () => {
        let {racer1Take, racer2Take} = await instance.calculateSplits(weiify(20), weiify(80));

        assertWeiEqualAmount(racer1Take, 20);
        assertWeiEqualAmount(racer2Take, 80);
    });

    it("should return an 80/20 split when the designations were 70/30", async () => {
        let {racer1Take, racer2Take} = await instance.calculateSplits(weiify(140), weiify(60));

        assertWeiEqualAmount(racer1Take, 160);
        assertWeiEqualAmount(racer2Take, 40);
    });

    it("should return a 20/80 split when the designations were 30/70", async () => {
        let {racer1Take, racer2Take} = await instance.calculateSplits(weiify(60), weiify(140));

        assertWeiEqualAmount(racer1Take, 40);
        assertWeiEqualAmount(racer2Take, 160);
    });

    it("should return an 80/20 split when one racer has a small fraction more", async () => {
        let {racer1Take, racer2Take} = await instance.calculateSplits(weiify(1000.000001), weiify(1000));

        assertWeiEqualAmount(racer1Take, 1600.0000008);
        assertWeiEqualAmount(racer2Take,  400.0000002);
    });

    it("should return an 20/80 split when one racer has a small fraction more", async () => {
        let {racer1Take, racer2Take} = await instance.calculateSplits(weiify(1000), weiify(1000.000001));

        assertWeiEqualAmount(racer1Take,  400.0000002);
        assertWeiEqualAmount(racer2Take, 1600.0000008);
    });

    it("should return a 100/0 split when one racer receives zero designations", async () => {
        let {racer1Take, racer2Take} = await instance.calculateSplits(weiify(10), weiify(0));

        assertWeiEqualAmount(racer1Take, 10);
        assertWeiEqualAmount(racer2Take, 0);
    });

    it("should return a 0/100 split when one racer receives zero designations", async () => {
        let {racer1Take, racer2Take} = await instance.calculateSplits(weiify(0), weiify(10));

        assertWeiEqualAmount(racer1Take, 0);
        assertWeiEqualAmount(racer2Take, 10);
    });

    it("should return a 90/10 split when that is the proportion of designations", async () => {
        let {racer1Take, racer2Take} = await instance.calculateSplits(weiify(90), weiify(10));

        assertWeiEqualAmount(racer1Take, 90);
        assertWeiEqualAmount(racer2Take, 10);
    });

    it("should return a 10/90 split when that is the proportion of designations", async () => {
        let {racer1Take, racer2Take} = await instance.calculateSplits(weiify(10), weiify(90));

        assertWeiEqualAmount(racer1Take, 10);
        assertWeiEqualAmount(racer2Take, 90);
    });

    it("should return an proportional split when one racer dominates the other", async () => {
        let {racer1Take, racer2Take} = await instance.calculateSplits(weiify(10000), weiify(0.001));

        assertWeiEqualAmount(racer1Take, 10000);
        assertWeiEqualAmount(racer2Take, 0.001);
    });

    it("should return an proportional split when one racer dominates the other", async () => {
        let {racer1Take, racer2Take} = await instance.calculateSplits(weiify(0.00001), weiify(1000000));

        assertWeiEqualAmount(racer1Take, 0.00001);
        assertWeiEqualAmount(racer2Take, 1000000);
    });
});