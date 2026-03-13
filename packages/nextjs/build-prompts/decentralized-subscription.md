---
name: "Decentralized Subscription"
description: "Recurring payment system using ERC-20 token allowances for pull-based subscription payments."
imageUrl: "/assets/challenges/tokenVendor.svg"
---

# 🏗️ SPEC: Decentralized Subscription

## 1. 🎯 Objective
A recurring payment system where users approve token allowances, allowing a service provider to "pull" ERC-20 payments at set time intervals.

## 2. 🛠️ Pre-flight & Context
- **Framework:** Scaffold-ETH 2.
- **Check:** Verify if ./packages/nextjs/scaffold.config.ts exists directly in the current working directory (do not search subdirectories). If it doesn't exist, this is not a Scaffold-ETH 2 project. Follow the instructions at https://docs.scaffoldeth.io/SKILL.md to scaffold it first. If it exists, continue directly with building.

## 3. ⚙️ Builder Customizations (Tweak before prompting)
- `SUBSCRIPTION_INTERVAL`: 30 Days
- `UI_THEME`: Standard Web2 SaaS pricing page aesthetic.

## 4. 📜 Smart Contract Spec
- **Architecture:** Mapping of user to `nextPaymentDue` timestamp. Reference to ERC-20 token.
- **Core Functions:** Plan creation by provider. `subscribe()` (user grants allowance). `processPayment()` (provider pulls funds if interval passed).
- **Agent Autonomy:** Ensure robust protection so providers cannot pull funds earlier than the designated interval. 

## 5. 🖥️ Frontend Spec
- **Required Views:** Pricing tier selection for users, and a provider dashboard to manually process eligible payments.
- **Agent Autonomy:** Clearly explain the token allowance step to the user in the UI. Make the flow of approving ERC-20s feel like a smooth, trusted checkout.

## 6. 🚀 Next Iterations (Builder: ask the agent to add these later)
- [ ] Grace periods for failed payments.
- [ ] Tiered subscription levels unlocking different UI features.
- [ ] Automated payment pulling via Chainlink Automation.
