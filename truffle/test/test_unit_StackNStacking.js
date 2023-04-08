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

    describe ("Test StackN stacking", () => {
        beforeEach(async() => {
            //StackNDCAInstance = await StackNDCA.new({from: owner});
            usdcInstance = await ERC20.at(usdcAddress);
            StackNDCAInstance = await StackNDCA.new({from: owner});
            StackNTokenInstance = await StackNToken.new(StackNDCAInstance.address, {from: owner});
            StackNDCAInstance.setStackNTockenAddress(StackNTokenInstance.address, {from: owner});

        })

        it("Launch first DCA verify usdc stack value", async() => {
            usdcInstance = await ERC20.at(usdcAddress);
            await usdcInstance.approve(StackNDCAInstance.address, 100000000, { from: clientA });
            await StackNDCAInstance.depositUsdc(100000000, {from: clientA});
            await StackNDCAInstance.dcaAmount(10000000, {from: clientA});
            result = await StackNDCAInstance.makeDCA({from: clientA});
            expectEvent(result, 'usdcValueToStack', {usdcValue: BN(0)});
        });

        it("Launch 2 DCA verify usdc stack value", async() => {
            usdcInstance = await ERC20.at(usdcAddress);
            await usdcInstance.approve(StackNDCAInstance.address, 100000000, { from: clientA });
            await StackNDCAInstance.depositUsdc(100000000, {from: clientA});
            await StackNDCAInstance.dcaAmount(10000000, {from: clientA});
            await StackNDCAInstance.makeDCA({from: clientA});
            await time.increase(time.duration.minutes(2));
            result = await StackNDCAInstance.makeDCA({from: clientA});
            expectEvent(result, 'usdcValueToStack', {usdcValue: BN(90000000)});

        });

        it("Launch 2 DCA verify check stack balance", async() => {
            usdcInstance = await ERC20.at(usdcAddress);
            await usdcInstance.approve(StackNDCAInstance.address, 100000000, { from: clientA });
            await StackNDCAInstance.depositUsdc(100000000, {from: clientA});
            await StackNDCAInstance.dcaAmount(10000000, {from: clientA});
            await StackNDCAInstance.makeDCA({from: clientA});
            await time.increase(time.duration.minutes(2));
            result = await StackNDCAInstance.makeDCA({from: clientA});
            expectEvent(result, 'usdcValueToStack', {usdcValue: BN(90000000)});

        });


        it("Launch 3 DCA with 3 users verify check stack balance client A / stage 1", async() => {
            usdcInstance = await ERC20.at(usdcAddress);
            // client A deposit
            await usdcInstance.approve(StackNDCAInstance.address, 100000000, { from: clientA });
            await StackNDCAInstance.depositUsdc(100000000, {from: clientA});
            await StackNDCAInstance.dcaAmount(10000000, {from: clientA});

            
            // first month DCA
            await StackNDCAInstance.makeDCA({from: clientA});

            // test client A StackN balance
            result = await StackNDCAInstance.getMyStackNBalance({from: clientA});
            const expectedValue = new BN("2000000000000000000000");
            expect(result).to.be.bignumber.equal(expectedValue);
        });

        it("Launch 3 DCA with 3 users verify check stack balance client A / stage 2", async() => {
            usdcInstance = await ERC20.at(usdcAddress);
            // client A deposit
            await usdcInstance.approve(StackNDCAInstance.address, 100000000, { from: clientA });
            await StackNDCAInstance.depositUsdc(100000000, {from: clientA});
            await StackNDCAInstance.dcaAmount(10000000, {from: clientA});

            // first month DCA
            await StackNDCAInstance.makeDCA({from: clientA});

            // client B deposit
            await usdcInstance.approve(StackNDCAInstance.address, 100000000, { from: clientB });
            await StackNDCAInstance.depositUsdc(100000000, {from: clientB});
            await StackNDCAInstance.dcaAmount(50000000, {from: clientB});
        
            // second month DCA
            await time.increase(time.duration.minutes(2));
            result = await StackNDCAInstance.makeDCA({from: clientB});

            // test client A StackN balance
            result = await StackNDCAInstance.getMyStackNBalance({from: clientA});
            const expectedValue = new BN("3500000000000000000000");
            expect(result).to.be.bignumber.equal(expectedValue);
        });

        it("Launch 3 DCA with 3 users verify check stack balance client B / stage 2", async() => {
            usdcInstance = await ERC20.at(usdcAddress);
            // client A deposit
            await usdcInstance.approve(StackNDCAInstance.address, 100000000, { from: clientA });
            await StackNDCAInstance.depositUsdc(100000000, {from: clientA});
            await StackNDCAInstance.dcaAmount(10000000, {from: clientA});

            // first month DCA
            await StackNDCAInstance.makeDCA({from: clientA});

            // client B deposit
            await usdcInstance.approve(StackNDCAInstance.address, 100000000, { from: clientB });
            await StackNDCAInstance.depositUsdc(100000000, {from: clientB});
            await StackNDCAInstance.dcaAmount(50000000, {from: clientB});
        
            // second month DCA
            await time.increase(time.duration.minutes(2));
            result = await StackNDCAInstance.makeDCA({from: clientB});

            // test client A StackN balance
            result = await StackNDCAInstance.getMyStackNBalance({from: clientB});
            const expectedValue = new BN("500000000000000000000");
            expect(result).to.be.bignumber.equal(expectedValue);
        });

        it("Launch 3 DCA with 3 users verify check stack balance client A -> stage 3", async() => {
            usdcInstance = await ERC20.at(usdcAddress);
            // client A deposit
            await usdcInstance.approve(StackNDCAInstance.address, 100000000, { from: clientA });
            await StackNDCAInstance.depositUsdc(100000000, {from: clientA});
            await StackNDCAInstance.dcaAmount(10000000, {from: clientA});

            // first month DCA
            await StackNDCAInstance.makeDCA({from: clientA});

            // client B deposit
            await usdcInstance.approve(StackNDCAInstance.address, 100000000, { from: clientB });
            await StackNDCAInstance.depositUsdc(100000000, {from: clientB});
            await StackNDCAInstance.dcaAmount(50000000, {from: clientB});
        
            // second month DCA
            await time.increase(time.duration.minutes(2));
            await StackNDCAInstance.makeDCA({from: clientB});

            // third month DCA
            await time.increase(time.duration.minutes(2));
            await StackNDCAInstance.makeDCA({from: other});
            result = await StackNDCAInstance.getMyStackNBalance({from: clientA});
            expect(result).to.be.bignumber.equal(BN("4423076923076923076923"));
        });

        it("Launch 3 DCA with 3 users verify check stack balance client B -> stage 3", async() => {
            usdcInstance = await ERC20.at(usdcAddress);
            // client A deposit
            await usdcInstance.approve(StackNDCAInstance.address, 100000000, { from: clientA });
            await StackNDCAInstance.depositUsdc(100000000, {from: clientA});
            await StackNDCAInstance.dcaAmount(10000000, {from: clientA});

            // first month DCA
            await StackNDCAInstance.makeDCA({from: clientA});

            // client B deposit
            await usdcInstance.approve(StackNDCAInstance.address, 100000000, { from: clientB });
            await StackNDCAInstance.depositUsdc(100000000, {from: clientB});
            await StackNDCAInstance.dcaAmount(50000000, {from: clientB});
        
            // second month DCA
            await time.increase(time.duration.minutes(2));
            await StackNDCAInstance.makeDCA({from: clientB});

            // third month DCA
            await time.increase(time.duration.minutes(2));
            await StackNDCAInstance.makeDCA({from: other});
            result = await StackNDCAInstance.getMyStackNBalance({from: clientB});
            expect(result).to.be.bignumber.equal(BN("1076923076923076923076"));
        });

        it("Launch 3 DCA with 3 users verify check stack balance other -> stage 3", async() => {
            usdcInstance = await ERC20.at(usdcAddress);
            // client A deposit
            await usdcInstance.approve(StackNDCAInstance.address, 100000000, { from: clientA });
            await StackNDCAInstance.depositUsdc(100000000, {from: clientA});
            await StackNDCAInstance.dcaAmount(10000000, {from: clientA});

            // first month DCA
            await StackNDCAInstance.makeDCA({from: clientA});

            // client B deposit
            await usdcInstance.approve(StackNDCAInstance.address, 100000000, { from: clientB });
            await StackNDCAInstance.depositUsdc(100000000, {from: clientB});
            await StackNDCAInstance.dcaAmount(50000000, {from: clientB});
        
            // second month DCA
            await time.increase(time.duration.minutes(2));
            await StackNDCAInstance.makeDCA({from: clientB});

            // third month DCA
            await time.increase(time.duration.minutes(2));
            await StackNDCAInstance.makeDCA({from: other});
            result = await StackNDCAInstance.getMyStackNBalance({from: other});
            expect(result).to.be.bignumber.equal(BN("500000000000000000000"));
        });
    });
});