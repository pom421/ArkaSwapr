// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.18;

// import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

/**
 * @title ArkaStaking
 * @author Po Mauguet
 * @notice This contract is used for staking and rewarding of ArkaSwapr.
 */
contract ArkaStaking {
    /**
     * @notice The address of arkaMaster.
     */
    address payable owner;

    /**
     * @notice The address of the ArkaERC20 contract.
     */
    IERC20 public immutable arkaToken;

    /**
     * @notice The ETH amount to be rewarded.
     */
    uint public amountReward;

    /**
     * @notice Duration of rewards to be paid out in seconds
     */
    uint public duration;

    /**
     * @notice Timestamp of when the rewards finish
     */
    uint public finishAt;

    /**
     * @notice Minimum of last updated time and reward finish time
     */
    uint public updatedAt;

    /**
     * @notice Reward to be paid out per second
     */
    uint public rewardRate;

    /**
     * @notice Sum of (reward rate * duration * 1e18 / total supply)
     */
    uint public rewardPerToken;

    /**
     * @notice Total staked
     */
    uint public totalSupply;

    /**
     * @notice User address => rewardPerToken
     */
    mapping(address => uint) public userRewardPerTokenPaid;

    /**
     * @notice User address => rewards to be claimed
     */
    mapping(address => uint) public rewards;

    /**
     * @notice User address => staked amount
     */
    mapping(address => uint) public stakeBalanceOf;

    event Deposit(address indexed user, uint amount);
    event Withdraw(address indexed user);
    event RewardClaimed(address indexed user);
    event TransferUnclaimedReward();

    constructor(address _stakingToken) payable {
        owner = payable(msg.sender);
        arkaToken = IERC20(_stakingToken);

        duration = 10 minutes;

        // Set the amount of reward to be paid out.
        amountReward = msg.value;

        // Set the reward rate (by second).
        rewardRate = amountReward / duration;

        require(rewardRate > 0, "reward rate = 0");

        finishAt = block.timestamp + duration;
        updatedAt = block.timestamp;
    }

    /**
     * @dev Modifier to update the reward of a user.
     * @param _account The user to update the reward for.
     *
     * @notice This modifier is used to update the reward of a user before executing a function.
     * @notice Also, it updates the rewardPerToken and updatedAt variables.
     */
    modifier updateReward(address _account) {
        rewardPerToken = _calculateRewardPerToken();
        updatedAt = _lastTimeRewardApplicable();

        if (_account != address(0)) {
            rewards[_account] = calculateRewardForAccount(_account);
            userRewardPerTokenPaid[_account] = rewardPerToken;
        }

        _;
    }

    /**
     * @notice This function is used to get the current time or finishAt at last.
     *
     * @dev Current time or finishAt at last.
     * This is used to calculate the reward per token in defining period where total supply is constant.
     */
    function _lastTimeRewardApplicable() private view returns (uint) {
        return finishAt <= block.timestamp ? finishAt : block.timestamp;
    }

    /**
     * @notice This function is used to calculate the reward per token for the current period.
     * @dev Function to calculate the reward per token for the current period. Global for all user at a given time.
     *
     * @return The reward per token for the current period.
     */
    function _calculateRewardPerToken() private view returns (uint) {
        if (totalSupply == 0) {
            return 0;
        }

        return
            rewardPerToken +
            (rewardRate * (_lastTimeRewardApplicable() - updatedAt) * 1e18) /
            totalSupply;
    }

    /**
     * @notice This function is used to calculate the reward for a user until now.
     * @dev Function to calculate the reward for a user until now.
     *
     * @param _account The user to calculate the reward for.
     * @return The reward for a user until now.
     */
    function calculateRewardForAccount(
        address _account
    ) public view returns (uint) {
        return
            rewards[_account] +
            ((stakeBalanceOf[_account] *
                (_calculateRewardPerToken() -
                    userRewardPerTokenPaid[_account])) / 1e18);
    }

    /**
     * @notice This function is used to stake ARKA tokens.
     *
     * @param _amount The amount of ARKA to deposit.
     */
    function deposit(uint _amount) external updateReward(msg.sender) {
        require(_amount > 0, "amount = 0");
        // The user needs to approve next to arkaToken before this transfer.
        arkaToken.transferFrom(msg.sender, address(this), _amount);
        stakeBalanceOf[msg.sender] += _amount;
        totalSupply += _amount;

        emit Deposit(msg.sender, _amount);
    }

    /**
     * @notice This function is used to withdraw ARKA tokens.
     */
    function withdraw() external updateReward(msg.sender) {
        arkaToken.transfer(msg.sender, stakeBalanceOf[msg.sender]);
        totalSupply -= stakeBalanceOf[msg.sender];
        stakeBalanceOf[msg.sender] = 0;

        emit Withdraw(msg.sender);
    }

    /**
     * @notice This function is used to claim the reward when the staking is finished.
     */
    function claimReward() external updateReward(msg.sender) {
        uint reward = rewards[msg.sender];

        if (reward > 0) {
            // Reset the rewards to 0 first, to prevent reentrancy.
            rewards[msg.sender] = 0;
            (bool sent, ) = payable(msg.sender).call{value: reward}("");
            require(sent, "Failed to send Ether");
        }

        emit RewardClaimed(msg.sender);
    }

    /**
     * @notice Function to transfer the unclaimed rewards to the master contract and not lose tokens.
     */
    function transferUnclaimedReward() external {
        require(
            msg.sender == owner,
            "Only owner can transfer unclaimed rewards"
        );
        require(block.timestamp > finishAt, "The staking is not finished yet");

        (bool sent, ) = owner.call{value: address(this).balance}("");

        require(sent, "Failed to send Ether");

        emit TransferUnclaimedReward();
    }
}
