const StackNDCA = artifacts.require("StackNDCA");
const ERC20 = artifacts.require("IERC20");
const {BN, expectRevert, expectEvent} = require('@openzeppelin/test-helpers');
const {expect} = require('chai');
const usdcAddress = "0x07865c6E87B9F70255377e024ace6630C1Eaa37F";


contract("StackNDCA", accounts => {

    let StackNDCAInstance;
    let erc20Instance;

    const owner = accounts[0];
    const clientA = accounts[1];
    const clientB = accounts[2];
    const other = accounts[3];

    describe ("First Deposit", () => {
        beforeEach(async() => {
            StackNDCAInstance = await StackNDCA.new({from: owner});

        })

        it("Client A make a deposit without approve", async() => {
            result = StackNDCAInstance.depositUsdc(100000000, {from: clientA})
            await expectRevert(result,"ERC20: transfer amount exceeds allowance");
        });

        it("Client A make a deposit under deposit the limit ", async() => {
            erc20Instance = await ERC20.at(usdcAddress);
            await erc20Instance.approve(StackNDCAInstance.address, 99999999, { from: clientA });
            allowance =  await erc20Instance.allowance(clientA, StackNDCAInstance.address);
            balance = await erc20Instance.balanceOf(clientA);
            result = StackNDCAInstance.depositUsdc(99999999, {from: clientA})
            await expectRevert(result,"minimum deposit is 100 usdc");
        });


        it("Client A make a deposit check account balance", async() => {
            erc20Instance = await ERC20.at(usdcAddress);
            await erc20Instance.approve(StackNDCAInstance.address, 100000000, { from: clientA });
            await StackNDCAInstance.depositUsdc(100000000, {from: clientA});
            result =  await StackNDCAInstance.getMyUsdcBalance({from: clientA});
            expect(result).to.be.bignumber.equal(BN(100000000));
        });


        it("Client A make a deposit  check event", async() => {
            erc20Instance = await ERC20.at(usdcAddress);
            await erc20Instance.approve(StackNDCAInstance.address, 100000000, { from: clientA });
            result = await StackNDCAInstance.depositUsdc(100000000, {from: clientA})
            expectEvent(result, 'UserDepositUsdc', {user: clientA , amount: BN(100000000)})
        });

        it("Client a try to define DCA Amout without Deposit", async() => {
            result = StackNDCAInstance.dcaAmount(100000000, {from: clientA});
            await expectRevert(result, "you have no monney in dca pool");
        });

        it("Client A make a deposit and try to define DCA Amout under the limit", async() => {
            erc20Instance = await ERC20.at(usdcAddress);
            await erc20Instance.approve(StackNDCAInstance.address, 100000000, { from: clientA });
            result = await StackNDCAInstance.depositUsdc(100000000, {from: clientA})
            result = StackNDCAInstance.dcaAmount(9999999, {from: clientA});
            await expectRevert(result,"minimum dca is 10 usdc");
        });

        it("Client A make a deposit and define DCA Amout at the limit check event", async() => {
            erc20Instance = await ERC20.at(usdcAddress);
            await erc20Instance.approve(StackNDCAInstance.address, 100000000, { from: clientA });
            result = await StackNDCAInstance.depositUsdc(100000000, {from: clientA})
            result = await StackNDCAInstance.dcaAmount(10000000, {from: clientA});
            expectEvent(result, 'UserDcaAmount', {user: clientA , amount: BN(10000000)})
        });

        it("Client A make a deposit and define DCA Amout at the limit check balance", async() => {
            erc20Instance = await ERC20.at(usdcAddress);
            await erc20Instance.approve(StackNDCAInstance.address, 100000000, { from: clientA });
            result = await StackNDCAInstance.depositUsdc(100000000, {from: clientA})
            result = await StackNDCAInstance.dcaAmount(10000000, {from: clientA});
            result =  await StackNDCAInstance.getMyUsdcDca({from: clientA});
            expect(result).to.be.bignumber.equal(BN(10000000));
        });


    });
});