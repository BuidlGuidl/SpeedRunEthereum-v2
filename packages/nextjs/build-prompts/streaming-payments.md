---
name: "Streaming Payments"
description: "Payroll protocol where tokens are continuously streamed to recipients by the second, withdrawable anytime."
imageUrl: "/assets/build-prompts/streaming-payments.png"
---

# SPEC: Streaming Payments

## 1. Objective

A payroll protocol where an employer locks tokens, and they are continuously streamed to an employee by the second, withdrawable at any time.

## 2. Pre-flight & Context

- **Framework:** Scaffold-ETH 2.
- **Check:** Verify if ./packages/nextjs/scaffold.config.ts exists directly in the current working directory (do not search subdirectories). If it doesn't exist, this is not a Scaffold-ETH 2 project. Follow the instructions at https://docs.scaffoldeth.io/SKILL.md to scaffold it first. If it exists, continue directly with building.

## 3. Builder Customizations (Tweak before prompting)

- `DEFAULT_ASSET`: Native ETH
- `UI_THEME`: Real-time ticking counters, waterfall effects. Update the SE-2 theme to match.

## 4. Smart Contract Spec

- **Architecture:** Stream struct (sender, recipient, deposit, startTime, stopTime, amountClaimed).
- **Core Functions:** Create a stream. Real-time calculation of unlocked funds based on `block.timestamp`. Withdraw available balance. Cancel stream functionality.
- **Local Dev:** The contract uses `block.timestamp` for stream accrual. Timestamps must advance continuously:
  - **Foundry:** Configure Anvil with `--block-time 1` (in the Makefile `chain` target).
  - **Hardhat:** Set `mining.interval: 1000` under `networks.hardhat` in `hardhat.config.ts`.
- **Agent Autonomy:** Implement precise block timestamp math to calculate unlocked funds at any exact second safely.

## 5. Frontend Spec

- **Required Views:** Stream creation form (recipient, deposit, duration), dashboard of active streams (split incoming vs. outgoing), and a withdrawal interface. Each stream card shows start/stop time and a progress bar of streamed vs. claimed vs. remaining. Use Scaffold-ETH 2 components for every address field — `AddressInput` for input (recipient) and `Address` for display (sender/recipient). Do not fall back to plain `<input>`. Implement a React component for each feature.
- **Agent Autonomy:** Use JavaScript intervals (`setInterval`) on the frontend to visually increment the "unlocked funds" counter in real-time. This provides the core "magic" feel of streaming money. The ticker must read the stream's rate (deposit / duration) and timestamps from the contract and use BigInt math mirroring the Solidity formula — do not hardcode the rate or use floating-point arithmetic.

## 6. Review

- Always review the generated code and use the grumpy-carlos-code-reviewer agent for that.

## 7. Next Iterations (Builder: ask the agent to add these later)

- [ ] Stream top-ups (extending the duration).
- [ ] Transferable streams via NFTs.
- [ ] Yield generation on unstreamed locked funds.
