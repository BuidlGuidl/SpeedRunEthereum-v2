---
name: "Streaming Payments"
description: "Payroll protocol where tokens are continuously streamed to recipients by the second, withdrawable anytime."
imageUrl: "/assets/challenges/tokenVendor.svg"
---

# 🏗️ SPEC: Streaming Payments

## 1. 🎯 Objective
A payroll protocol where an employer locks tokens, and they are continuously streamed to an employee by the second, withdrawable at any time.

## 2. 🛠️ Pre-flight & Context
- **Framework:** Scaffold-ETH 2.
- **Check:** Verify if ./packages/nextjs/scaffold.config.ts exists directly in the current working directory (do not search subdirectories). If it doesn't exist, this is not a Scaffold-ETH 2 project. Follow the instructions at https://docs.scaffoldeth.io/SKILL.md to scaffold it first. If it exists, continue directly with building.

## 3. ⚙️ Builder Customizations (Tweak before prompting)
- `DEFAULT_ASSET`: Native ETH
- `UI_THEME`: Real-time ticking counters, waterfall effects.

## 4. 📜 Smart Contract Spec
- **Architecture:** Stream struct (sender, recipient, deposit, startTime, stopTime, amountClaimed).
- **Core Functions:** Create a stream. Real-time calculation of unlocked funds based on `block.timestamp`. Withdraw available balance. Cancel stream functionality.
- **Agent Autonomy:** Implement precise block timestamp math to calculate unlocked funds at any exact second safely.

## 5. 🖥️ Frontend Spec
- **Required Views:** Stream creation form, dashboard of active streams, withdrawal interface.
- **Agent Autonomy:** Use JavaScript intervals (`setInterval`) on the frontend to visually increment the "unlocked funds" counter in real-time. This provides the core "magic" feel of streaming money.

## 6. 🚀 Next Iterations (Builder: ask the agent to add these later)
- [ ] Stream top-ups (extending the duration).
- [ ] Transferable streams via NFTs.
- [ ] Yield generation on unstreamed locked funds.
