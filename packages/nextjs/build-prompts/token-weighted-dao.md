---
name: "Token-Weighted DAO"
description: "A governance DAO where token holders create proposals, vote weighted by holdings, and execute on-chain actions through a timelock."
imageUrl: "/assets/build-prompts/dao-proposals.png"
featured: true
---

# SPEC: Token-Weighted DAO

## 1. Objective

A decentralized governance system where holders of an ERC-20 governance token can create proposals, vote (weighted by their token holdings), and execute approved proposals on-chain through a timelock delay. Built on OpenZeppelin's Governor contracts, the industry standard used by ENS, Arbitrum, and other major DAOs.

## 2. Pre-flight & Context

- **Framework:** Scaffold-ETH 2.
- **Check:** Verify if ./packages/nextjs/scaffold.config.ts exists directly in the current working directory (do not search subdirectories). If it doesn't exist, this is not a Scaffold-ETH 2 project. Follow the instructions at https://docs.scaffoldeth.io/SKILL.md to scaffold it first. If it exists, continue directly with building.

## 3. Builder Customizations (Tweak before prompting)

- `VOTING_DELAY`: 0 blocks (zero for local dev. Production DAOs use 1-2 days)
- `VOTING_PERIOD`: 10 blocks (short for demo — each faucet click or transaction mines one block on local dev. Production DAOs use 3-7 days)
- `PROPOSAL_THRESHOLD`: 0 (0 for demo so anyone can propose)
- `QUORUM_PERCENTAGE`: 4 (% of total supply that must vote For+Abstain to pass)
- `TIMELOCK_DELAY`: 1 block (short for demo, production uses 1-2 days)
- `UI_THEME`: Serious, governance-focused — dark tones, clean typography, forum-style layout similar to Tally.

## 4. Smart Contract Spec

- **Architecture:** Three contracts using OpenZeppelin v5 — a governance token using `ERC20Votes` for snapshot-based voting power, a Governor contract using OZ's modular Governor system and OZ's `TimelockController` for execution delay.
- **Governance Token:** An ERC-20 with `ERC20Votes` and `ERC20Permit`. Include a public `mint(address to, uint256 amount)` function for testing. The token must use timestamp-based voting (`clock()` returns `block.timestamp`) for L2 compatibility.
- **Governor:** Wire up the modular OZ Governor with the builder customization values. It handles the full proposal lifecycle: propose → vote (For/Against/Abstain) → queue → execute.
- **Timelock:** Use OZ's `TimelockController` directly — do not write a custom one. The governor is the sole proposer, anyone can execute after delay.
- **Agent Autonomy:** The token must auto-delegate to the recipient on mint — `ERC20Votes` requires `delegate(self)` before voting power activates, and without it `getVotes()` returns 0 silently. The `propose()` function takes `string description` but `queue()` and `execute()` take `bytes32 descriptionHash` — handle this correctly in the deploy script and frontend.

## 5. Frontend Spec

- **Required Views:**
  - **Governance Dashboard**: Token balance with mint button, delegation panel (current delegate, voting power, delegate button), active and past proposals list with state badges and vote tally bars.
  - **Proposal Detail**: Full description, target addresses, vote distribution (For/Against/Abstain) with quorum progress indicator, voting buttons, queue and execute buttons based on proposal state, voter list from events.
  - **Create Proposal**: Description input, transaction builder (target, value, calldata — support multiple targets), submit button.
- **Agent Autonomy:** Build the `UI_THEME`. The delegation panel is essential — if a user has tokens but hasn't delegated, show a prominent call-to-action to delegate. Color-code proposal states and show countdowns for active and queued proposals. Use Scaffold-ETH 2 components for every address field — `AddressInput` for user input (delegate address, proposal targets) and `Address` for display (current delegate, proposer, voters). Do not fall back to plain `<input>` or raw hex strings.

## 6. Review

- Always review the generated code and use the grumpy-carlos-code-reviewer agent for that.

## 7. How to Use

After building, walk the user through the full governance flow locally. Use these SE-2 local dev features:

- **Burner wallets**: SE-2 auto-generates a burner wallet per browser session. Opening an incognito tab creates a new persona — use this to simulate multiple voters.
- **Local faucet**: The faucet button (top-right) sends ETH **and mines a block**, advancing `block.timestamp`. The local chain does NOT auto-mine — the faucet (or any transaction) is how you advance time past voting delay, voting period, and timelock delay.
- **Governance parameters**: Current low values (`VOTING_DELAY: 0`, etc.) are strictly for fast local testing. **Increase these to safe values (e.g., 1-7 days) for production deployments.**
- Tailor the testing walkthrough to the actual contracts and UI you scaffolded.

## 8. Next Iterations (Builder: ask the agent to add these later)

- [ ] Quadratic voting: weight votes by the square root of token holdings.
- [ ] Vote delegation dashboard for delegating to other addresses.
- [ ] Proposal categories and filtering.
- [ ] Off-chain voting with Snapshot integration for gasless temperature checks.
- [ ] Proposal markdown rendering for rich descriptions.
