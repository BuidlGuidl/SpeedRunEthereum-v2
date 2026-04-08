---
name: "Commit-Reveal Game"
description: "Rock-Paper-Scissors betting game using cryptographic hashing to prevent blockchain front-running."
imageUrl: "/assets/build-prompts/commit-reveal-game.png"
---

# SPEC: Commit-Reveal Game

## 1. Objective

A betting game that uses cryptographic hashing to hide a player's move until both have played, preventing blockchain front-running.

## 2. Pre-flight & Context

- **Framework:** Scaffold-ETH 2.
- **Check:** Verify if ./packages/nextjs/scaffold.config.ts exists directly in the current working directory (do not search subdirectories). If it doesn't exist, this is not a Scaffold-ETH 2 project. Follow the instructions at https://docs.scaffoldeth.io/SKILL.md to scaffold it first. If it exists, continue directly with building.

## 3. Builder Customizations (Tweak before prompting)

- `GAME_TYPE`: Rock-Paper-Scissors
- `UI_THEME`: Arcade style or competitive 1v1 interface.

## 4. Smart Contract Spec

- **Architecture:** Player addresses, commitments (bytes32 hashes), revealed moves, Game state.
- **Core Functions:** Commit phase (players submit hash of move + secret salt). Reveal phase (submit plain text move and salt to verify hash). Resolution logic.
- **Agent Autonomy:** Design a robust state machine for the game phases (Waiting, Committed, Revealed, Resolved). Ensure tie-breaking logic is fair.

## 5. Frontend Spec

- **Required Views:** A two-step game interface guiding the user securely through Committing and Revealing, adding a bet when commiting. Show the games from the user and the open games (created games with no opponent). Add a game page (/game/[id]).
- **Agent Autonomy:** The frontend MUST handle the local generation of the secret salt and the `keccak256` hashing locally before sending the transaction. Hide this complexity from the user for a smooth UX.

## 6. Review

- Always review the generated code and use the grumpy-carlos-code-reviewer agent for that.

## 7. Next Iterations (Builder: ask the agent to add these later)

- [ ] Timeout penalties (if a player commits but refuses to reveal).
- [ ] Multiplayer tournaments.
- [ ] Matchmaking lobby for open games.
