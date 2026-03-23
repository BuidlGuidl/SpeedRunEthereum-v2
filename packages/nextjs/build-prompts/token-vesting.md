---
name: "Token Vesting Schedule"
description: "Linear token unlocking over time to prevent sudden market dumping for team members and investors."
imageUrl: "/assets/build-prompts/token-vesting.png"
---

# SPEC: Token Vesting Schedule

## 1. Objective
A continuous payment system where a team member's or investor's tokens are unlocked linearly over time to prevent sudden market dumping.

## 2. Pre-flight & Context
- **Framework:** Scaffold-ETH 2.
- **Check:** Verify if ./packages/nextjs/scaffold.config.ts exists directly in the current working directory (do not search subdirectories). If it doesn't exist, this is not a Scaffold-ETH 2 project. Follow the instructions at https://docs.scaffoldeth.io/SKILL.md to scaffold it first. If it exists, continue directly with building.

## 3. Builder Customizations (Tweak before prompting)
- `DEFAULT_DURATION_DAYS`: 365
- `ADMIN_ADDRESS`: *(optional)* If set, this address becomes the owner of the TokenVesting contract. If not set, defaults to the deployer (`msg.sender`).
- `UI_THEME`: Corporate, clean, transparent team dashboard.

## 4. Smart Contract Spec
- **Architecture:** Vesting schedules mapping beneficiaries to total amount, start time, duration, and claimed amounts.
- **Admin Configuration:** The `TokenVesting` constructor must accept an `_admin` address parameter and pass it to `Ownable(_admin)`. The deploy script should use `ADMIN_ADDRESS` from Builder Customizations if provided; otherwise default to the deployer address.
- **Test Token Minting:** The `VestingToken` `mint()` function should be open (no `onlyOwner`) so anyone can mint test tokens to try the app.
- **Core Functions:** Admin function to create a schedule. A `withdraw()` function calculating linear token unlock based on current `block.timestamp`.
- **Agent Autonomy:** Handle the precision math for linear unlocking cleanly. Decide how to track multiple vesting schedules efficiently.

## 5. Frontend Spec
- **Required Views:** Admin view to create schedules. Employee view visualizing their personal vesting schedule.
- **Owner Check:** The admin page must check ownership against the `TokenVesting` contract's `owner()`, NOT the `VestingToken` contract's `owner()`. These are different contracts with potentially different owners.
- **Auto-Approval Flow:** When creating a vesting schedule, the frontend must first call `VestingToken.approve(vestingContractAddress, maxUint256)` before calling `createSchedule()`, since `createSchedule` uses `transferFrom` internally. Without this, users will hit an `ERC20InsufficientAllowance` error.
- **Agent Autonomy:** Build the `UI_THEME` utilizing a visual "progress bar" using Tailwind CSS to cleanly indicate locked vs. unlocked vs. claimed tokens.

## 6. Next Iterations (Builder: ask the agent to add these later)
- [ ] Revocable streams (admin can cancel future unvested tokens).
- [ ] Cliff periods (no tokens unlock until X months pass).
- [ ] Multi-beneficiary batch creation.
