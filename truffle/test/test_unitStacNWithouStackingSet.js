const StackNDCA = artifacts.require("StackNDCA");
const StackNToken = artifacts.require("StackNToken");
const ERC20 = artifacts.require("IERC20");
const {BN, expectRevert, expectEvent, time} = require('@openzeppelin/test-helpers');
const {expect} = require('chai');
const web3 = require('web3');
const usdcAddress = "0x07865c6E87B9F70255377e024ace6630C1Eaa37F";
const wethAddress = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


contract("StackNDCA", accounts => {

    let StackNTokenInstance;;
    let StackNDCAInstance;
    let usdcInstance;
    let wethInstance;

    const owner = accounts[0];
    const clientA = accounts[1];
    const clientB = accounts[2];
    const other = accounts[3];
    console.log("owner", owner)
    console.log("clientA", clientA)
    console.log("clientB", clientB)
    console.log("other", other)

    beforeEach(async() => {
        usdcInstance = await ERC20.at(usdcAddress);
        StackNDCAInstance = await StackNDCA.new({from: owner});
    })

    it("Client try to launch makeDCA without StackN token set in smart contract by owner", async() => {
        await usdcInstance.approve(StackNDCAInstance.address, 100000000, { from: clientA });
        await StackNDCAInstance.depositUsdc(100000000, {from: clientA});
        await StackNDCAInstance.dcaAmount(10000000, {from: clientA});
        result = StackNDCAInstance.makeDCA({from: clientA});
        await expectRevert(result, "stackNTockenSmartContractAddress variable is not set");
    });
});
