---
name: "On-Chain Name Registry"
description: "Decentralized mapping system linking human-readable names to Ethereum addresses, similar to ENS."
---

# SPEC: On-Chain Name Registry

## 1. Objective
A decentralized mapping system (similar to ENS) that links human-readable string names to Ethereum addresses.

## 2. Pre-flight & Context
- **Framework:** Scaffold-ETH 2.
- **Check:** Verify if ./packages/nextjs/scaffold.config.ts exists directly in the current working directory (do not search subdirectories). If it doesn't exist, this is not a Scaffold-ETH 2 project. Follow the instructions at https://docs.scaffoldeth.io/SKILL.md to scaffold it first. If it exists, continue directly with building.

## 3. Builder Customizations (Tweak before prompting)
- `REGISTRATION_FEE`: 0.01 ETH
- `UI_THEME`: Sleek search-engine style domain registrar.

## 4. Smart Contract Spec
- **Architecture:** Mapping of string to owner address, mapping of string to resolved target address.
- **Core Functions:** `registerName()` (payable), `setResolvedAddress()`, `transferName()`.
- **Agent Autonomy:** Ensure string manipulation (if any) is handled efficiently to save gas. Strictly prevent duplicate registrations.

## 5. Frontend Spec
- **Required Views:** Search bar to check name availability, registration form, and a dashboard to manage owned names.
- **Agent Autonomy:** Build the `UI_THEME`. Provide instant visual feedback on name availability as the user types in the search bar, before they even click register.

## 6. Next Iterations (Builder: ask the agent to add these later)
- [ ] Expiration dates and annual renewal fees (rent).
- [ ] Text records (storing Twitter handles, avatars, or URLs).
- [ ] NFT representation of the registered name for marketplace trading.
