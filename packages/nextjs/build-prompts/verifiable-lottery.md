---
name: "Verifiable Lottery"
description: "On-chain lottery where users buy tickets and a winner is chosen pseudo-randomly from the pool."
imageUrl: "/assets/challenges/diceGame.svg"
---

# 🏗️ SPEC: Verifiable Lottery

## 1. 🎯 Objective
A pool where users buy tickets, and a winner is chosen pseudo-randomly to demonstrate basic blockchain randomness concepts.

## 2. 🛠️ Pre-flight & Context
- **Framework:** Scaffold-ETH 2.
- **Check:** Verify if ./packages/nextjs/scaffold.config.ts exists directly in the current working directory (do not search subdirectories). If it doesn't exist, this is not a Scaffold-ETH 2 project. Follow the instructions at https://docs.scaffoldeth.io/SKILL.md to scaffold it first. If it exists, continue directly with building.

## 3. ⚙️ Builder Customizations (Tweak before prompting)
- `TICKET_PRICE`: 0.05 ETH
- `UI_THEME`: Flashy, casino-inspired, celebratory.

## 4. 📜 Smart Contract Spec
- **Architecture:** Array of players, Lottery state (Open, Closed).
- **Core Functions:** Buy tickets by sending fixed ETH amount. Admin function to trigger draw. Pseudo-random winner selection using `block.prevrandao` or `blockhash`.
- **Agent Autonomy:** Keep state arrays clean and gas-efficient. Reset the state safely for the next round after a winner is drawn and the pot is transferred.

## 5. 🖥️ Frontend Spec
- **Required Views:** Display current pot size, list of active players, and a big "Buy Ticket" CTA.
- **Agent Autonomy:** Make it feel like a real lottery! Add celebratory UI states or animations when a winner is drawn.

## 6. 🚀 Next Iterations (Builder: ask the agent to add these later)
- [ ] Integrate Chainlink VRF for mathematically secure randomness.
- [ ] Remove the admin role by allowing the first user after the deadline to trigger the draw.
- [ ] Multi-winner tiers.
