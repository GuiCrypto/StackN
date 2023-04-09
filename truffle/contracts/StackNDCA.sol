// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./BokkyPooBahsDateTimeLibrary.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

// @title StackNDCA
// @author Guilhain Averlant
// @notice A smart contract for dollar cost averaging into Ethereum and distributing StackN tokens
// @dev This contract interacts with IERC20, ISwapRouter, IWETH, and StackNTocken interfaces to perform its functions


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


interface StackNTocken {
    function mintStackN(address _account, uint _amount) external;
}

contract StackNDCA is Ownable {
    ISwapRouter constant swapRouter = ISwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);

    address public usdcSmartContractAddress=0x07865c6E87B9F70255377e024ace6630C1Eaa37F;  //goerli
    address public weth9SmartContractAddress=0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6; // goerli
    address public stackNTockenSmartContractAddress;

    uint stackNMonthlyMint = 2000000000000000000000;

    uint24 constant poolFee = 3000;
    uint256 usdcStackValue;
    uint256 usdcDcaValue;

    uint256 public lastExecutionTime;
    
    struct userAccount {
        uint256 usdcAmount;
        uint256 usdcDCA;
        uint256 ethAmount;
        uint256 stackNAmount;
        uint256 usdcStackAmount;
        uint256 previousMonthUsdcDcaAmount;
    }

    mapping (address => userAccount) userAccounts;
    
    address[] dcaUsers;
    
    event UserDepositUsdc(address indexed user, uint256 amount);
    event UserWithdrawUsdc(address indexed user, uint256 amount);
    event UserWithdrawEth(address indexed user, uint256 amount);
    event UserWithdrawStackN(address indexed user, uint256 amount);
    event UserDcaAmount(address indexed user, uint256 amount);
    event usdcValueToSwap(uint usdcValue);
    event usdcValueToStack(uint usdcValue);
    event wethValueSwaped(uint wethValue);

    constructor() {
        lastExecutionTime = BokkyPooBahsDateTimeLibrary.subMonths(block.timestamp, 1);
    }


    // @notice Modifier to ensure that a function is executed only once per month
    // @dev Use this modifier to restrict functions or actions that should be allowed 
    // @dev to execute only once per month. This modifier should be placed before the 
    // @dev function or action that requires the check.
    modifier onlyOncePerMonth() {
        uint nowTimestamp = block.timestamp;
        require(BokkyPooBahsDateTimeLibrary.diffMonths(lastExecutionTime, nowTimestamp) >= 1, "This function can only be called once each month");
        lastExecutionTime = nowTimestamp;
        _;
    }

    // @notice Modifier to check if the DCA pool is full before allowing an action
    // @dev Use this modifier to restrict functions or actions that require the DCA pool not
    // @dev to be full. This modifier should be placed before the function or action that requires
    // @dev the check.
    modifier checkPoolIsFUll() {
        if (userAccounts[msg.sender].usdcDCA == 0) {
            require(dcaUsers.length + 1 < 20000, "dca pool is full");
        }
        _;
    }

    // @notice Allows a user to deposit USDC tokens into the contract for DCA purposes
    // @param amount The amount of USDC tokens to be deposited by the user
    // @dev The function should handle the transfer of USDC tokens from the user to the contract. 
    // @dev Ensure that the user has approved the contract to transfer USDC on their behalf 
    // @dev before executing the transfer. Update any relevant data structures or mappings to 
    // @dev track the user's deposit and DCA settings.
    function depositUsdc(uint256 amountIn) public virtual checkPoolIsFUll {
        require(amountIn >= 100000000, "minimum deposit is 100 usdc");
        IERC20(usdcSmartContractAddress).transferFrom(msg.sender, address(this), amountIn);
        userAccounts[msg.sender].usdcAmount += amountIn;
        emit UserDepositUsdc(msg.sender, amountIn);
    }

    // @notice Calculates the amount of a token to be purchased based on the user's DCA settings
    // @param user The address of the user for whom the DCA amount is being calculated
    // @return dcaAmount The calculated amount of the token to be purchased according to the user's DCA settings
    // @dev This function calculates the DCA amount for a user based on their settings
    // @dev (e.g., frequency, duration, and total amount). Implement the logic to 
    // @dev retrieve the user's DCA settings and perform the necessary calculations.
    function dcaAmount(uint256 amountIn) public checkPoolIsFUll {
        require(userAccounts[msg.sender].usdcAmount>0, "you have no monney in dca pool");
        require(amountIn>=10000000, "minimum dca is 10 usdc");
        require(userAccounts[msg.sender].usdcAmount>=amountIn, "your dca must be superior than your deposit");
        if (userAccounts[msg.sender].usdcDCA == 0) {
            dcaUsers.push(msg.sender);
        }
        userAccounts[msg.sender].usdcDCA = amountIn;
        emit UserDcaAmount(msg.sender, amountIn);
    }

    // @notice Allows users to withdraw their USDC balance from the contract
    // @param amount The amount of USDC (in smallest unit) the user wishes to withdraw
    // @dev This function should be called when a user wants to withdraw their USDC
    // @dev from the contract. Ensure the user has sufficient balance before 
    // @dev processing the withdrawal.
    function widthdrawUsdc() public {
        require(userAccounts[msg.sender].usdcAmount > 0, "no usdc on your account");
        uint amountOu = userAccounts[msg.sender].usdcAmount;
        userAccounts[msg.sender].usdcAmount = 0;
        userAccounts[msg.sender].usdcDCA = 0;
        userAccounts[msg.sender].stackNAmount = 0;
        IERC20(usdcSmartContractAddress).transfer(msg.sender, amountOu);
        emit UserWithdrawUsdc(msg.sender, amountOu);
    }

    // @notice Allows users to withdraw their ETH balance from the contract
    // @param amount The amount of ETH (in wei) the user wishes to withdraw
    // @dev This function should be called when a user wants to withdraw their
    // @dev ETH from the contract. Ensure the user has sufficient balance before
    // @dev processing the withdrawal.
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

    // @notice Allows users to withdraw their StackN tokens from the contract
    // @param amount The amount of StackN tokens the user wishes to withdraw
    // @dev This function should be called when a user wants to withdraw their 
    // @dev StackN tokens from the contract. Ensure the user has sufficient
    // @dev balance before processing the withdrawal.
    function widthdrawStackN() public {
        require(userAccounts[msg.sender].stackNAmount > 0, "no StackN on your account");
        uint amountOu = userAccounts[msg.sender].stackNAmount;
        userAccounts[msg.sender].stackNAmount = 0;
        IERC20(stackNTockenSmartContractAddress).transfer(msg.sender, amountOu);
        emit UserWithdrawStackN(msg.sender, amountOu);
    }
    
    // @notice Retrieves the current value of the user's dollar cost average (DCA) position in the contract
    // @param user The address of the user for whom the DCA value is being calculated
    // @return dcaValue The calculated DCA value for the user, based on their contributions and the current token prices
    // @dev This function should be called when you want to get the DCA value of a user's position within the contract
    function getDcaValue() private { 
        address[] memory dcaUsersArray = new address[](dcaUsers.length);
        uint dcaUsersArrayIndex = 0;
        usdcDcaValue=0;
        usdcStackValue=0;
        for (uint i = 0; i < dcaUsers.length; i++) {
            address user = dcaUsers[i];
            // compute DCA usdc value
            if (userAccounts[user].usdcAmount > 0) {
                if (userAccounts[user].usdcAmount >= userAccounts[user].usdcStackAmount) {
                    usdcStackValue += userAccounts[user].usdcStackAmount;
                }
            }
            if (userAccounts[user].usdcDCA > 0) {
                if (userAccounts[user].usdcAmount >= userAccounts[user].usdcDCA) {
                    userAccounts[user].usdcAmount -= userAccounts[user].usdcDCA;
                    userAccounts[user].previousMonthUsdcDcaAmount = userAccounts[user].usdcStackAmount;
                    userAccounts[user].usdcStackAmount = userAccounts[user].usdcAmount;
                    usdcDcaValue += userAccounts[user].usdcDCA;
                    dcaUsersArray[dcaUsersArrayIndex] = user;
                    dcaUsersArrayIndex++;
                } else {
                    userAccounts[user].usdcDCA = 0;
                }
            }
        }
        require(usdcDcaValue>0, "There is no monney to DCA");

        if (usdcDcaValue > 0) {
            // Réduire la taille du tableau dcaUsersArray à la taille réelle
            assembly {
                mstore(dcaUsersArray, dcaUsersArrayIndex)
            }
        }
        
        dcaUsers = dcaUsersArray;
        emit usdcValueToSwap(usdcDcaValue);
        emit usdcValueToStack(usdcStackValue);
    }

    // @notice Swaps an exact amount of ETH for the maximum amount of another token on a Uniswap-like exchange
    // @param tokenOut The address of the token to receive in exchange for ETH
    // @param amountIn The exact amount of ETH to be swapped
    // @param amountOutMin The minimum amount of the output token to receive from the swap
    // @param path The Uniswap-like exchange path to follow for the swap, starting with WETH and ending with the desired output token
    // @param deadline The timestamp after which the swap will be considered invalid
    // @return amountOut The amount of the output token received from the swap
    // @dev This function should be called when the user wants to execute a swap from ETH to another token, ensuring the amounts and path are set correctly
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

    // @notice Distributes the swapped WETH among the DCA users based on their proportional USDC amounts and mints StackN tokens
    // @param _usdcDcaValue The total amount of USDC used for DCA
    // @param _usdcStackValue The total amount of USDC used for StackN rewards
    // @param _weth09DcaValue The total amount of WETH obtained from swapping the USDC
    // @dev This function should be called internally after the DCA process is executed
    function splitWethBalancetoUsers(uint _usdcDcaValue, uint _usdcStackValue,  uint _weth09DcaValue) private {
        // add stack to make dca launcher
        userAccounts[msg.sender].stackNAmount += stackNMonthlyMint * 25 / 100;
        // for first make DCA or if users are  widthdraw then deposit usdc (in the same month)
        // they are by definition no usdc stack during the first month, 
        // then the 75% of stackNMonthlyMint is added to the dca launcher
        if (_usdcStackValue == 0) {
            userAccounts[msg.sender].stackNAmount += stackNMonthlyMint * 75 / 100;
        }
        
        for (uint i = 0; i < dcaUsers.length; i++) {
            address user = dcaUsers[i];
            if (userAccounts[user].usdcDCA > 0) {
                // weth split
                uint weth09Amount = _weth09DcaValue * userAccounts[user].usdcDCA / _usdcDcaValue;
                userAccounts[user].ethAmount += weth09Amount;

                // StackN token split
                if (_usdcStackValue > 0) {
                    // StackN token split
                    uint addStackN = (stackNMonthlyMint * 75 / 100) * userAccounts[user].previousMonthUsdcDcaAmount / _usdcStackValue;
                    userAccounts[user].stackNAmount += addStackN;
                }
            }
        }
    }

    // @notice Executes the Dollar-Cost Averaging (DCA) process for all eligible users
    // @dev This function can only be called once per minute
    // @dev Make sure the stackNTockenSmartContractAddress is set before calling this function
    function makeDCA() public onlyOncePerMonth {
        require(stackNTockenSmartContractAddress!=address(0), "stackNTockenSmartContractAddress variable is not set");

        // update dcaUsers and usdcDcaValue
        getDcaValue();
        
        uint weth09DcaValue = getWethContractBalance();
        
        // swap usdc to eth 
        swapExactInputEth(usdcDcaValue);

        // recompute weth09 balance to make weth09 distribution
        weth09DcaValue = getWethContractBalance() - weth09DcaValue;
        emit wethValueSwaped(weth09DcaValue);

        // minth 2000 StackNToken
        StackNTocken(stackNTockenSmartContractAddress).mintStackN(address(this), stackNMonthlyMint);
        
        // split weth balance to dca users / mint stackN and split to StackN users
        splitWethBalancetoUsers(usdcDcaValue, usdcStackValue, weth09DcaValue);
    }

    // @notice Retrieves the StackN token balance of the smart contract
    // @return The StackN token balance of the smart contract
    function getStackNContractBalance() public view returns (uint256) {
        return IERC20(stackNTockenSmartContractAddress).balanceOf(address(this));
    }

    // @notice Retrieves the Wrapped Ether (WETH) balance of the smart contract
    // @return The WETH balance of the smart contract
    function getWethContractBalance() public view returns (uint256) {
        return IERC20(weth9SmartContractAddress).balanceOf(address(this));
    }

    // @notice Retrieves the user's current USDC balance
    // @return The user's USDC balance
    function getMyUsdcBalance() public view returns (uint) {
        return userAccounts[msg.sender].usdcAmount;
    }

    // @notice Retrieves the user's current Ether balance
    // @return The user's Ether balance
    function getMyEthBalance() public view returns (uint) {
        return userAccounts[msg.sender].ethAmount;
    }

    // @notice Retrieves the user's current StackN token balance
    // @return The user's StackN token balance
    function getMyStackNBalance() public view returns (uint) {
        return userAccounts[msg.sender].stackNAmount;
    }

    // @notice Retrieves the user's current USDC amount allocated for Dollar Cost Averaging (DCA)
    // @param user The user address for which to retrieve the DCA amount
    // @return The user's USDC amount allocated for DCA
    function getMyUsdcDca() public view returns (uint) {
        return userAccounts[msg.sender].usdcDCA;
    }

    // @notice Set the StackN token contract address
    // @param _address The address of the StackN token contract
    function setStackNTockenAddress(address _address) public onlyOwner {
        stackNTockenSmartContractAddress =_address;
    }

    // Fallback function
    receive() external payable {}
}