var startTimestamp = null;

module.exports = function (web3) {

    // All of this is done soley so we make no assumptions about the time on the
    // network in relation to time on the local machine. Multiple test cycles
    // run against the same long-running local fork will repeatedly increase the
    // time, so it's unsafe to assume any relationship between real time and network
    // time.

    return async () => {
        if (null === startTimestamp) {
            if (!web3) {
                throw new Error("Must provide web3 context first time dev-params is loaded");
            }

            let block = await web3.eth.getBlock('latest');
            startTimestamp = block.timestamp;
        }

        return {
            daiHolder: "0xd580D07e01fb01149A54eb547f6A8806757B24e0",
            racer1: "0x471294BB791B2eb793Fe1c316359Fa9CB356268D",
            racer2: "0xFf168cCaa9d8C2d34e1ABC03e9b8e6c99F0Afff1",
            endDate: daysFrom(30, startTimestamp),
            donor1: "0x2bAacB68F59F36d67d25ECa8820aeF58F0808d55",
            donor2: "0x8509EDb28eae65fd5E0cD87074b5Bd90ecbD8955",
            tokenAddr: "0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359", // Dai (Sai)
            otherAddr: "0xf5B9a2143408907966c28db50C117A33d92788C3",
        }
    }
}

function daysFrom(days, timestamp) {
    return timestamp + days * 24 * 60 * 60;
}
