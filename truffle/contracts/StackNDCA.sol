// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "https://github.com/bokkypoobah/BokkyPooBahsDateTimeLibrary/blob/master/contracts/BokkyPooBahsDateTimeLibrary.sol";

interface IERC20 {
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function deposit() external payable;
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

interface ISwapRouter {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }
 
    /// @notice Swaps `amountIn` of one token for as much as possible of another token
    /// @param params The parameters necessary for the swap, encoded as `ExactInputSingleParams` in calldata
    /// @return amountOut The amount of the received token
    function exactInputSingle(ExactInputSingleParams calldata params) external payable returns (uint256 amountOut);
}


interface IWETH {
    function withdraw(uint256 amount) external;
}


contract StackNDCA {
    ISwapRouter public constant swapRouter = ISwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);

    address public usdcSmartContractAddress=0x07865c6E87B9F70255377e024ace6630C1Eaa37F;  //goerli
    address public weth9SmartContractAddress=0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6; // goerli

    uint24 public constant poolFee = 3000;
    uint256 public udscDcaValue;

    uint256 public lastExecutionTime;
    bool public functionExecuted;

    
    struct userAccount {
        uint256 usdcAmount;
        uint256 usdcDCA;
        uint256 ethAmount;
    }

    mapping (address => userAccount) public userAccounts; // TODO put it private
    
    address[] public dcaUsers; // todo put it private

    event DepositUsdc(address indexed user, uint256 amount);
    event WithdrawUsdc(address indexed user, uint256 amount);

    event weth09DcaAmount(uint256 value);
    event usdcAccountDown(address indexed user, uint256 amount);
    event weth09AccountUp(address indexed user, uint256 amount);    

    event ratioComputation(address indexed user, uint256 weth09DcaValue, uint256 usdcAmount, uint256 ethAmount, uint256 ethRatioValue);
    event dcaUsersEvent(address[] dcaUsers);
    event dcaValueEvent(uint);

    constructor() {
        //lastExecutionTime = BokkyPooBahsDateTimeLibrary.subMonths(block.timestamp, 1);
        lastExecutionTime = BokkyPooBahsDateTimeLibrary.subMinutes(block.timestamp, 1);
    }

    modifier onlyOncePerMinute() {
        uint nowTimestamp = block.timestamp;
        require(BokkyPooBahsDateTimeLibrary.diffMinutes(lastExecutionTime, nowTimestamp) >= 1, "This function can only be called once each minutes");
        lastExecutionTime = nowTimestamp;
        _;
    }

    modifier onlyOncePerMonth() {
        uint nowTimestamp = block.timestamp;
        require(BokkyPooBahsDateTimeLibrary.diffMonths(lastExecutionTime, nowTimestamp) >= 1, "This function can only be called once each month");
        lastExecutionTime = nowTimestamp;
        _;
    }

    function getBlockTimestamp() public view returns(uint) {
        return block.timestamp;
    }

    function getBlockSuperiorThan1Minutes(uint _today, uint _timestamp) public pure returns(bool) {
        uint256 timeSinceLastExecution =  _today - _timestamp;
        return timeSinceLastExecution >= 1 minutes;
    }

    function getMonth(uint256 timestamp) public pure returns (uint256) {
        return BokkyPooBahsDateTimeLibrary.getMonth(timestamp);
    }

    function addMonths(uint _timestamp, uint _months) public pure returns(uint) {
        return BokkyPooBahsDateTimeLibrary.addMonths(_timestamp, _months);
    }

    function subMonths(uint _timestamp, uint _months) public pure returns(uint) {
        return BokkyPooBahsDateTimeLibrary.subMonths(_timestamp, _months);
    }

    function diffMonths(uint fromTimestamp, uint toTimestamp) public pure returns (uint _months) {
        return BokkyPooBahsDateTimeLibrary.diffMonths(fromTimestamp, toTimestamp);
    }


    function dcaUsersLength() public view returns(uint256) {
        return dcaUsers.length;
    }

    function myUsdcBalance() public view returns (uint256) {
        return userAccounts[msg.sender].usdcAmount;
    }

    function myEthBalance() public view returns (uint256) {
        return userAccounts[msg.sender].ethAmount;
    }

    function depositUsdc(uint256 amountIn) public {
        require(amountIn >= 100000000);
        IERC20(usdcSmartContractAddress).transferFrom(msg.sender, address(this), amountIn);
        userAccounts[msg.sender].usdcAmount += amountIn;
        emit DepositUsdc(msg.sender, amountIn);
    }

    function widthdrawUsdc() public {
        require(userAccounts[msg.sender].usdcAmount > 0, "no usdc on your account");
        uint amountOu = userAccounts[msg.sender].usdcAmount;
        userAccounts[msg.sender].usdcAmount = 0;
        userAccounts[msg.sender].usdcDCA = 0;
        IERC20(usdcSmartContractAddress).transfer(msg.sender, amountOu);
        emit WithdrawUsdc(msg.sender, amountOu);
    }

    function widthdrawEth() public {
        require(userAccounts[msg.sender].ethAmount > 0, "no eth on your account");
        uint amountOu = userAccounts[msg.sender].ethAmount;
        userAccounts[msg.sender].ethAmount = 0;
        IERC20(weth9SmartContractAddress).approve(address(this), amountOu);
        IWETH(weth9SmartContractAddress).withdraw(amountOu);
        (bool success, ) = msg.sender.call{value: amountOu}("");
        require(success, "Transfer failed.");

    }

    function widthdrawEthApprove(uint256 amountOu) public {
        IERC20(weth9SmartContractAddress).approve(address(this), amountOu);
    }

    function widthdrawEthWidthdrawWeth09(uint256 amountOu) public {
        IWETH(weth9SmartContractAddress).withdraw(amountOu);
    }

    function widthdrawEthIEht(uint256 amountOu) public {
        (bool success, ) = msg.sender.call{value: amountOu}("");
        require(success, "Transfer failed.");
    }

    function dcaAmount(uint256 amountIn) public {
        // todo ajouter  un require doit avoir des sous, ne peut pas etre mis a zero
                // TODO verify usage
        if (userAccounts[msg.sender].usdcDCA == 0) {
            dcaUsers.push(msg.sender);
        }

        userAccounts[msg.sender].usdcDCA = amountIn;

    }


    function getDcaValue() public { // TODO put it internal
        address[] memory dcaUsersArray = new address[](dcaUsers.length);
        uint dcaUsersArrayIndex = 0;
        udscDcaValue=0;
        for (uint i = 0; i < dcaUsers.length; i++) {
            address user = dcaUsers[i];
            if (userAccounts[user].usdcDCA > 0 && userAccounts[user].usdcAmount >= userAccounts[user].usdcDCA) {
                userAccounts[user].usdcAmount -= userAccounts[user].usdcDCA;
                emit usdcAccountDown(user, userAccounts[user].usdcDCA);
                udscDcaValue += userAccounts[user].usdcDCA;
                dcaUsersArray[dcaUsersArrayIndex] = user;
                dcaUsersArrayIndex++;
            } else {
                userAccounts[user].usdcDCA = 0;
            }
        }
        require(udscDcaValue>0, "There is no monney to DCA");

        if (udscDcaValue > 0) {
            // Réduire la taille du tableau dcaUsersArray à la taille réelle
            assembly {
                mstore(dcaUsersArray, dcaUsersArrayIndex)
            }
        }
        emit dcaUsersEvent(dcaUsers);
        emit dcaUsersEvent(dcaUsersArray);
        
        dcaUsers = dcaUsersArray;
        emit dcaValueEvent(udscDcaValue);



        //return udscDcaValue;
    }

    function swapExactInputEth(uint256 amountIn) public {
 
        // autoriser uniswap à utiliser nos tokens
        IERC20(usdcSmartContractAddress).approve(address(swapRouter), amountIn);
        
        //Creation des paramètres pour l'appel du swap
        ISwapRouter.ExactInputSingleParams memory params =
            ISwapRouter.ExactInputSingleParams({
                tokenIn: usdcSmartContractAddress,
                tokenOut: weth9SmartContractAddress,
                fee: poolFee,
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: 0, // put chainlink oracle here with slipage
                sqrtPriceLimitX96: 0
            });
 
        // effectuer le swap, WETH sera transféré au smart contract
        swapRouter.exactInputSingle(params);
    }

    function getWethContractBalance() public view returns (uint256) {
        return IERC20(weth9SmartContractAddress).balanceOf(address(this));
    }

    function getUsdcContractBalance() public view returns (uint256) {
        return IERC20(usdcSmartContractAddress).balanceOf(address(this));
    }

    function splitWethBalancetoUsers(uint _usdcdcaValue, uint _weth09DcaValue) public {
        for (uint i = 0; i < dcaUsers.length; i++) {
            address user = dcaUsers[i];
            if (userAccounts[user].usdcDCA > 0) {
                uint weth09Amount = _weth09DcaValue * userAccounts[user].usdcDCA / _usdcdcaValue;
                emit ratioComputation(user, _weth09DcaValue, userAccounts[user].usdcDCA, _usdcdcaValue, weth09Amount);
                userAccounts[user].ethAmount += weth09Amount;
                emit weth09AccountUp(user, weth09Amount);
            }
        }
    }


    function makeDCA() public onlyOncePerMinute {

        // update dcaUsers and udscDcaValue
        getDcaValue();
        
        uint weth09DcaValue = getWethContractBalance();
        
        // swap usdc to eth 
        swapExactInputEth(udscDcaValue);

        // recompute weth09 balance to make weth09 distribution
        weth09DcaValue = getWethContractBalance() - weth09DcaValue;
        emit weth09DcaAmount(weth09DcaValue);
        
        // split weth balance to dca users
        splitWethBalancetoUsers(udscDcaValue, weth09DcaValue);
    }

    receive() external payable {

    }
// TODO LIST
// mettre un compteur d'utilisateurs
// mettre un require quand le nombre d'utilisateurs est trop bas pour pas lancer l'excution du make dca
}