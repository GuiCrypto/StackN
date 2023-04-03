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
    ISwapRouter constant swapRouter = ISwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);

    address usdcSmartContractAddress=0x07865c6E87B9F70255377e024ace6630C1Eaa37F;  //goerli
    address weth9SmartContractAddress=0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6; // goerli

    uint24 constant poolFee = 3000;
    uint256 udscDcaValue;

    uint256 lastExecutionTime;
    bool functionExecuted;

    
    struct userAccount {
        uint256 usdcAmount;
        uint256 usdcDCA;
        uint256 ethAmount;
    }

    mapping (address => userAccount) private userAccounts;
    
    address[] dcaUsers; // todo put it private

    event UserDepositUsdc(address indexed user, uint256 amount);
    event UserWithdrawUsdc(address indexed user, uint256 amount);
    event UserWithdrawEth(address indexed user, uint256 amount);
    event UserDcaAmount(address indexed user, uint256 amount);
    event usdcValueToSwap(uint);
    event wethValueSwaped(uint);


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

    modifier checkPoolIsFUll() {
        if (userAccounts[msg.sender].usdcDCA == 0) {
            require(dcaUsers.length + 1 < 3, "dca pool is full");
        }
        _;
    }

    function depositUsdc(uint256 amountIn) public checkPoolIsFUll {
        require(amountIn >= 100000000, "minimum deposit is 100 usdc");
        IERC20(usdcSmartContractAddress).transferFrom(msg.sender, address(this), amountIn);
        userAccounts[msg.sender].usdcAmount += amountIn;
        emit UserDepositUsdc(msg.sender, amountIn);
    }

    function dcaAmount(uint256 amountIn) public checkPoolIsFUll {
        require(userAccounts[msg.sender].usdcAmount>0, "you have ;no monney in dca pool");
        require(amountIn>10000000, "minimum dca is 10 usdc");
        require(userAccounts[msg.sender].usdcAmount>=amountIn);
        if (userAccounts[msg.sender].usdcDCA == 0) {
            dcaUsers.push(msg.sender);
        }
        userAccounts[msg.sender].usdcDCA = amountIn;
        emit UserDcaAmount(msg.sender, amountIn);
    }

    function widthdrawUsdc() public {
        require(userAccounts[msg.sender].usdcAmount > 0, "no usdc on your account");
        uint amountOu = userAccounts[msg.sender].usdcAmount;
        userAccounts[msg.sender].usdcAmount = 0;
        userAccounts[msg.sender].usdcDCA = 0;
        IERC20(usdcSmartContractAddress).transfer(msg.sender, amountOu);
        emit UserWithdrawUsdc(msg.sender, amountOu);
    }

    function widthdrawEth() public {
        require(userAccounts[msg.sender].ethAmount > 0, "no eth on your account");
        uint amountOu = userAccounts[msg.sender].ethAmount;
        userAccounts[msg.sender].ethAmount = 0;
        IERC20(weth9SmartContractAddress).approve(address(this), amountOu);
        IWETH(weth9SmartContractAddress).withdraw(amountOu);
        (bool success, ) = msg.sender.call{value: amountOu}("");
        require(success, "Transfer failed.");
        emit UserWithdrawEth(msg.sender, amountOu);
    }

    function getDcaValue() private { 
        address[] memory dcaUsersArray = new address[](dcaUsers.length);
        uint dcaUsersArrayIndex = 0;
        udscDcaValue=0;
        for (uint i = 0; i < dcaUsers.length; i++) {
            address user = dcaUsers[i];
            if (userAccounts[user].usdcDCA > 0 && userAccounts[user].usdcAmount >= userAccounts[user].usdcDCA) {
                userAccounts[user].usdcAmount -= userAccounts[user].usdcDCA;
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
        
        dcaUsers = dcaUsersArray;
        emit usdcValueToSwap(udscDcaValue);
    }

    function swapExactInputEth(uint256 amountIn) private {
 
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


    function splitWethBalancetoUsers(uint _usdcdcaValue, uint _weth09DcaValue) private {
        for (uint i = 0; i < dcaUsers.length; i++) {
            address user = dcaUsers[i];
            if (userAccounts[user].usdcDCA > 0) {
                uint weth09Amount = _weth09DcaValue * userAccounts[user].usdcDCA / _usdcdcaValue;
                userAccounts[user].ethAmount += weth09Amount;
            }
        }
    }

    function getWethContractBalance() private view returns (uint256) {
        return IERC20(weth9SmartContractAddress).balanceOf(address(this));
    }

    function makeDCA() public onlyOncePerMinute {

        // update dcaUsers and udscDcaValue
        getDcaValue();
        
        uint weth09DcaValue = getWethContractBalance();
        
        // swap usdc to eth 
        swapExactInputEth(udscDcaValue);

        // recompute weth09 balance to make weth09 distribution
        weth09DcaValue = getWethContractBalance() - weth09DcaValue;
        emit wethValueSwaped(weth09DcaValue);
        
        // split weth balance to dca users
        splitWethBalancetoUsers(udscDcaValue, weth09DcaValue);
    }

    function getMyUsdcBalance() public view returns (uint) {
        return userAccounts[msg.sender].usdcAmount;
    }

    function getMyEthBalance() public view returns (uint) {
        return userAccounts[msg.sender].ethAmount;
    }

    function getMyUsdcDca() public view returns (uint) {
        return userAccounts[msg.sender].usdcDCA;
    }

    receive() external payable {}
}