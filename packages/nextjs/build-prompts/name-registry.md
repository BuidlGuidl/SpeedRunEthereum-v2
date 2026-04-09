---
name: "On-Chain Name Registry"
description: "A decentralized mapping system (similar to ENS) that links human-readable names to Ethereum addresses, with full reverse resolution."
imageUrl: "/assets/build-prompts/onchain-registry.png"
---

# SPEC: On-Chain Name Registry

## 1. Objective

A decentralized mapping system (similar to ENS) that links human-readable string names to Ethereum addresses, with full reverse resolution.

## 2. Pre-flight & Context

- **Framework:** Scaffold-ETH 2.
- **Check:** Verify if ./packages/nextjs/scaffold.config.ts exists directly in the current working directory (do not search subdirectories). If it doesn't exist, this is not a Scaffold-ETH 2 project. Follow the instructions at https://docs.scaffoldeth.io/SKILL.md to scaffold it first. If it exists, continue directly with building.

## 3. Builder Customizations (Tweak before prompting)

- `REGISTRATION_FEE`: 0.01 ETH
- `UI_THEME`: Sleek search-engine style domain registrar. Update the SE-2 theme to match.

## 4. Smart Contract Spec

- **Architecture:** Mapping of string to owner address, mapping of string to resolved target address, mapping of address to primary name, mapping of address to array of all names resolving to it.
- **Core Functions:** `registerName()` (payable), `setResolvedAddress()`, `transferName()`, `setPrimaryName()`, `reverseResolve()`, `getNamesForAddress()`.
- **Agent Autonomy:** Ensure string manipulation (if any) is handled efficiently to save gas. Strictly prevent duplicate registrations. Do not use `indexed` on string event parameters — indexed strings are hashed and their values become unreadable from event logs. When `setResolvedAddress()` changes the target, maintain the address-to-names array (remove from old, add to new).

## 5. Frontend Spec

- **Required Views:** Search bar to check name availability, registration form, and a dashboard to manage owned names.
- **Agent Autonomy:** Build the `UI_THEME`. Provide instant visual feedback on name availability as the user types in the search bar, before they even click register. Auto-detect pasted Ethereum addresses and switch to reverse lookup mode — show the primary name and all names resolving to that address. In the dashboard, show name cards with actions to set resolved address, transfer ownership, and set as primary name, with a badge on the current primary.

## 6. Review

- Always review the generated code and use the grumpy-carlos-code-reviewer agent for that.

## 7. Next Iterations (Builder: ask the agent to add these later)

- [ ] Expiration dates and annual renewal fees (rent).
- [ ] Text records (storing Twitter handles, avatars, or URLs).
- [ ] NFT representation of the registered name for marketplace trading.
