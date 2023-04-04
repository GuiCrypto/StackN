const StackNDCA = artifacts.require("StackNDCA");
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

    let StackNDCAInstance;
    let usdcInstance;
    let wethInstance;

    const owner = accounts[0];
    const clientA = accounts[1];
    const clientB = accounts[2];
    const other = accounts[3];

    describe ("Test all functions", () => {
        beforeEach(async() => {
            StackNDCAInstance = await StackNDCA.new({from: owner});
        })

        it("Client withdraw USDC on empty account", async() => {
            result = StackNDCAInstance.widthdrawUsdc({from: clientA});
            await expectRevert(result,"no usdc on your account");
        });

        it("Client withdraw Eth on empty account", async() => {
            result = StackNDCAInstance.widthdrawEth({from: clientA});
            await expectRevert(result,"no eth on your account");
        });


        it("Client A make a deposit without approve", async() => {
            result = StackNDCAInstance.depositUsdc(100000000, {from: clientA});
            await expectRevert(result,"ERC20: transfer amount exceeds allowance");
        });

        it("Client A make a deposit under deposit the limit ", async() => {
            usdcInstance = await ERC20.at(usdcAddress);
            await usdcInstance.approve(StackNDCAInstance.address, 99999999, { from: clientA });
            result = StackNDCAInstance.depositUsdc(99999999, {from: clientA});
            await expectRevert(result,"minimum deposit is 100 usdc");
        });


        it("Client A make a deposit check account balance", async() => {
            usdcInstance = await ERC20.at(usdcAddress);
            await usdcInstance.approve(StackNDCAInstance.address, 100000000, { from: clientA });
            await StackNDCAInstance.depositUsdc(100000000, {from: clientA});
            result =  await StackNDCAInstance.getMyUsdcBalance({from: clientA});
            expect(result).to.be.bignumber.equal(BN(100000000));
        });


        it("Client A make a deposit  check event", async() => {
            usdcInstance = await ERC20.at(usdcAddress);
            await usdcInstance.approve(StackNDCAInstance.address, 100000000, { from: clientA });
            result = await StackNDCAInstance.depositUsdc(100000000, {from: clientA});
            expectEvent(result, 'UserDepositUsdc', {user: clientA , amount: BN(100000000)});
        });

        it("Client a try to define DCA Amout without Deposit", async() => {
            result = StackNDCAInstance.dcaAmount(100000000, {from: clientA});
            await expectRevert(result, "you have no monney in dca pool");
        });

        it("Client A make a deposit and try to define DCA Amout under the limit", async() => {
            usdcInstance = await ERC20.at(usdcAddress);
            await usdcInstance.approve(StackNDCAInstance.address, 100000000, { from: clientA });
            await StackNDCAInstance.depositUsdc(100000000, {from: clientA})
            result = StackNDCAInstance.dcaAmount(9999999, {from: clientA});
            await expectRevert(result,"minimum dca is 10 usdc");
        });

        it("Client A make a deposit and try to define DCA Amout superior thant deposit", async() => {
            usdcInstance = await ERC20.at(usdcAddress);
            await usdcInstance.approve(StackNDCAInstance.address, 100000000, { from: clientA });
            await StackNDCAInstance.depositUsdc(100000000, {from: clientA})
            result = StackNDCAInstance.dcaAmount(100000001, {from: clientA});
            await expectRevert(result,"your dca must be superior than your deposit");
        });

        it("Client A make a deposit and define DCA Amout at the limit check event", async() => {
            usdcInstance = await ERC20.at(usdcAddress);
            await usdcInstance.approve(StackNDCAInstance.address, 100000000, { from: clientA });
            await StackNDCAInstance.depositUsdc(100000000, {from: clientA});
            result = await StackNDCAInstance.dcaAmount(10000000, {from: clientA});
            expectEvent(result, 'UserDcaAmount', {user: clientA , amount: BN(10000000)});
        });

        it("Client A make a deposit and define DCA Amout at the limit check balance", async() => {
            usdcInstance = await ERC20.at(usdcAddress);
            await usdcInstance.approve(StackNDCAInstance.address, 100000000, { from: clientA });
            await StackNDCAInstance.depositUsdc(100000000, {from: clientA});
            await StackNDCAInstance.dcaAmount(10000000, {from: clientA});
            result =  await StackNDCAInstance.getMyUsdcDca({from: clientA});
            expect(result).to.be.bignumber.equal(BN(10000000));
        });

        it("Launch first DCA verify usdc swap amount", async() => {
            usdcInstance = await ERC20.at(usdcAddress);
            await usdcInstance.approve(StackNDCAInstance.address, 100000000, { from: clientA });
            await StackNDCAInstance.depositUsdc(100000000, {from: clientA});
            await StackNDCAInstance.dcaAmount(10000000, {from: clientA});
            result = await StackNDCAInstance.makeDCA({from: clientA});
            expectEvent(result, 'usdcValueToSwap', {usdcValue: BN(10000000)});
        });

        it("Launch first DCA verify eth swaped amount", async() => {
            usdcInstance = await ERC20.at(usdcAddress);
            await usdcInstance.approve(StackNDCAInstance.address, 100000000, { from: clientA });
            await StackNDCAInstance.depositUsdc(100000000, {from: clientA});
            await StackNDCAInstance.dcaAmount(10000000, {from: clientA});
            result = await StackNDCAInstance.makeDCA({from: clientA});
            wethInstance = await ERC20.at(wethAddress);
            wethbalance = await wethInstance.balanceOf(StackNDCAInstance.address);
            expectEvent(result, 'wethValueSwaped', {wethValue: BN(wethbalance)});
        });

        it("Launch first DCA verify contract weth balance == client A weth account", async() => {
            usdcInstance = await ERC20.at(usdcAddress);
            await usdcInstance.approve(StackNDCAInstance.address, 100000000, { from: clientA });
            await StackNDCAInstance.depositUsdc(100000000, {from: clientA});
            await StackNDCAInstance.dcaAmount(10000000, {from: clientA});
            await StackNDCAInstance.makeDCA({from: clientA});
            result = await StackNDCAInstance.getMyEthBalance({from: clientA});
            wethInstance = await ERC20.at(wethAddress);
            wethbalance = await wethInstance.balanceOf(StackNDCAInstance.address);
            expect(result).to.be.bignumber.equal(BN(wethbalance));
        });

        it("Launch first DCA and withdraw ETH", async() => {
            usdcInstance = await ERC20.at(usdcAddress);
            await usdcInstance.approve(StackNDCAInstance.address, 100000000, { from: clientA });
            await StackNDCAInstance.depositUsdc(100000000, {from: clientA});
            await StackNDCAInstance.dcaAmount(10000000, {from: clientA});
            await StackNDCAInstance.makeDCA({from: clientA});
            wethbalance = await StackNDCAInstance.getMyEthBalance({from: clientA});
            result =  await StackNDCAInstance.widthdrawEth({from: clientA});
            expectEvent(result, 'UserWithdrawEth', {user: clientA, amount: BN(wethbalance)});
        });

        it("Launch two makeDCa without month pause", async() => {
            usdcInstance = await ERC20.at(usdcAddress);
            await usdcInstance.approve(StackNDCAInstance.address, 100000000, { from: clientA });
            await StackNDCAInstance.depositUsdc(100000000, {from: clientA});
            await StackNDCAInstance.dcaAmount(10000000, {from: clientA});
            await StackNDCAInstance.makeDCA({from: clientA});
            result = StackNDCAInstance.makeDCA({from: clientA});
            await expectRevert(result,"This function can only be called once each minutes");
        });

        it("Launch two makeDCa with month pause", async() => {
            usdcInstance = await ERC20.at(usdcAddress);
            await usdcInstance.approve(StackNDCAInstance.address, 100000000, { from: clientA });
            await StackNDCAInstance.depositUsdc(100000000, {from: clientA});
            await StackNDCAInstance.dcaAmount(10000000, {from: clientA});
            await StackNDCAInstance.makeDCA({from: clientA});
            await time.increase(time.duration.minutes(2));
            await StackNDCAInstance.makeDCA({from: clientA});
            result = await StackNDCAInstance.getMyUsdcBalance({from: clientA});
            expect(result).to.be.bignumber.equal(BN(80000000));

        });
    });
});