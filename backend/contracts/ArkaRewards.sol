// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title ArkaRewards
 * @author Po Mauguet
 * @notice This contract is used for staking and rewarding of ArkaSwapr.
 */
contract ArkaRewards is Ownable {
    IERC20 public immutable arkaToken;
    IERC20 public immutable rewardsToken;

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
    mapping(address => uint) public balanceOf;

    event StakeInitiated(address indexed user, uint amount);
    event StakeWithdrawn(address indexed user, uint amount);
    event RewardPaid(address indexed user, uint reward);
    event RewardsDurationUpdated(uint newDuration);
    event NewStake(address indexed user, uint amount);

    constructor(address _stakingToken, address _rewardToken) {
        arkaToken = IERC20(_stakingToken);
        rewardsToken = IERC20(_rewardToken);
    }

    /**
     * @dev Modifier to update the reward of a user.
     * @param _account The user to update the reward for.
     *
     * @notice This modifier is used to update the reward of a user before executing a function.
     * @notice Also, it updates the rewardPerToken and updatedAt variables.
     */
    modifier updateReward(address _account) {
        rewardPerToken = computeRewardPerToken();
        updatedAt = lastTimeRewardApplicable();

        if (_account != address(0)) {
            rewards[_account] = earned(_account);
            userRewardPerTokenPaid[_account] = rewardPerToken;
        }

        _;
    }

    function lastTimeRewardApplicable() public view returns (uint) {
        return _min(finishAt, block.timestamp);
    }

    /**
     * @dev Function to update the rewards duration.
     * @notice Update the rewards duration.
     */
    function computeRewardPerToken() public view returns (uint) {
        if (totalSupply == 0) {
            return rewardPerToken;
        }

        return
            rewardPerToken +
            (rewardRate * (lastTimeRewardApplicable() - updatedAt) * 1e18) /
            totalSupply;
    }

    function stake(uint _amount) external updateReward(msg.sender) {
        require(_amount > 0, "amount = 0");
        arkaToken.transferFrom(msg.sender, address(this), _amount);
        balanceOf[msg.sender] += _amount;
        totalSupply += _amount;
    }

    function withdraw(uint _amount) external updateReward(msg.sender) {
        require(_amount > 0, "amount = 0");
        balanceOf[msg.sender] -= _amount;
        totalSupply -= _amount;
        arkaToken.transfer(msg.sender, _amount);
    }

    function earned(address _account) public view returns (uint) {
        return
            rewards[_account] +
            ((balanceOf[_account] *
                (computeRewardPerToken() - userRewardPerTokenPaid[_account])) /
                1e18);
    }

    function getReward() external updateReward(msg.sender) {
        uint reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            rewardsToken.transfer(msg.sender, reward);
        }
    }

    function setRewardsDuration(uint _duration) external onlyOwner {
        require(finishAt < block.timestamp, "reward duration not finished");
        duration = _duration;
    }

    function notifyRewardAmount(
        uint _amount
    ) external onlyOwner updateReward(address(0)) {
        if (block.timestamp >= finishAt) {
            rewardRate = _amount / duration;
        } else {
            uint remainingRewards = (finishAt - block.timestamp) * rewardRate;
            rewardRate = (_amount + remainingRewards) / duration;
        }

        require(rewardRate > 0, "reward rate = 0");
        require(
            rewardRate * duration <= rewardsToken.balanceOf(address(this)),
            "reward amount > balance"
        );

        finishAt = block.timestamp + duration;
        updatedAt = block.timestamp;
    }

    function _min(uint x, uint y) private pure returns (uint) {
        return x <= y ? x : y;
    }
}

// interface IERC20 {
//     function totalSupply() external view returns (uint);

//     function balanceOf(address account) external view returns (uint);

//     function transfer(address recipient, uint amount) external returns (bool);

//     function allowance(
//         address owner,
//         address spender
//     ) external view returns (uint);

//     function approve(address spender, uint amount) external returns (bool);

//     function transferFrom(
//         address sender,
//         address recipient,
//         uint amount
//     ) external returns (bool);

//     event Transfer(address indexed from, address indexed to, uint value);
//     event Approval(address indexed owner, address indexed spender, uint value);
// }
