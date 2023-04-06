// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title ArkaStaking
 * @author Po Mauguet
 * @notice This contract is used for staking and rewarding of ArkaSwapr.
 */
contract ArkaStaking is Ownable {
    IERC20 public immutable arkaToken;

    /**
     * @notice The ETH amount to be rewarded.
     */
    uint public amountReward;

    // Duration of rewards to be paid out in seconds
    uint public duration;
    // Timestamp of when the rewards finish
    uint public finishAt;
    // Minimum of last updated time and reward finish time
    uint public updatedAt;
    // Reward to be paid out per second
    uint public rewardRate;
    // Sum of (reward rate * duration * 1e18 / total supply)
    uint public rewardPerToken;
    // Total staked
    uint public totalSupply;

    // User address => rewardPerToken
    mapping(address => uint) public userRewardPerTokenPaid;
    // User address => rewards to be claimed
    mapping(address => uint) public rewards;
    // User address => staked amount
    mapping(address => uint) public stakeBalanceOf;

    event StakeInitiated(address indexed user, uint amount);
    event StakeWithdrawn(address indexed user, uint amount);
    event RewardPaid(address indexed user, uint reward);
    event RewardsDurationUpdated(uint newDuration);
    event NewStake(address indexed user, uint amount);

    constructor(address _stakingToken) payable {
        arkaToken = IERC20(_stakingToken);

        duration = 7 days;

        // Set the amount of reward to be paid out.
        amountReward = msg.value;

        // Set the reward rate (by second).
        rewardRate = amountReward / duration;

        require(rewardRate > 0, "reward rate = 0");

        finishAt = block.timestamp + duration;
        updatedAt = block.timestamp;
    }

    /**
     *
     * @dev Modifier to update the reward of a user.
     * @param _account The user to update the reward for.
     *
     * @notice This modifier is used to update the reward of a user before executing a function.
     * @notice Also, it updates the rewardPerToken and updatedAt variables.
     */
    modifier updateReward(address _account) {
        rewardPerToken = calculateRewardPerToken();
        updatedAt = lastTimeRewardApplicable();

        if (_account != address(0)) {
            rewards[_account] = calculateRewardForAccount(_account);
            userRewardPerTokenPaid[_account] = rewardPerToken;
        }

        _;
    }

    /**
     * @dev Current time or finishAt at last.
     * This is used to calculate the reward per token in defining period where total supply is constant.
     * @notice This function is used to get the current time or finishAt at last.
     */
    function lastTimeRewardApplicable() public view returns (uint) {
        return finishAt <= block.timestamp ? finishAt : block.timestamp;
    }

    /**
     * @dev Function to calculate the reward for a user until now.
     * @notice This function is used to calculate the reward for a user until now.
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
                (calculateRewardPerToken() -
                    userRewardPerTokenPaid[_account])) / 1e18);
    }

    /**
     * @dev Function to calculate the reward per token for the current period. Global for all user at a given time.
     * @notice This function is used to calculate the reward per token for the current period.
     *
     * @return The reward per token for the current period.
     */
    function calculateRewardPerToken() public view returns (uint) {
        if (totalSupply == 0) {
            return 0;
        }

        return
            rewardPerToken +
            (rewardRate * (lastTimeRewardApplicable() - updatedAt) * 1e18) /
            totalSupply;
    }

    // deposit
    function deposit(uint _amount) external updateReward(msg.sender) {
        require(_amount > 0, "amount = 0");
        arkaToken.transferFrom(msg.sender, address(this), _amount);
        stakeBalanceOf[msg.sender] += _amount;
        totalSupply += _amount;
    }

    // withdraw
    function withdraw() external updateReward(msg.sender) {
        arkaToken.transfer(msg.sender, stakeBalanceOf[msg.sender]);
        totalSupply -= stakeBalanceOf[msg.sender];
        stakeBalanceOf[msg.sender] = 0;
    }

    // claimReward
    function claimReward() external updateReward(msg.sender) {
        if (rewards[msg.sender] > 0) {
            (bool sent, ) = payable(msg.sender).call{
                value: rewards[msg.sender]
            }("");
            require(sent, "Failed to send Ether");
            rewards[msg.sender] = 0;
        }
    }
}
