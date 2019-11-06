
module.exports = function (web3) {

    let increaseTime = async (seconds) => {
        await web3.currentProvider.send({
            jsonrpc: "2.0",
            method: "evm_increaseTime",
            params: [seconds],
            id: 0,
        }, (error) => {
            if (error) {
                throw error;
            }
        });
    }

    let jumpToTime = async (timestamp) => {
        let now = Math.round(Date.now() / 1000);
        let jumpTime = timestamp - now;

        await increaseTime(jumpTime);
    }

    return { increaseTime, jumpToTime }
};
