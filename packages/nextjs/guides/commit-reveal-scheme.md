---
title: "Commit-Reveal Scheme in Solidity"
description: "Learn how to implement the commit-reveal scheme in Solidity to prevent front-running attacks in blockchain games. Complete guide with code examples, security best practices, and real-world applications."
image: "/assets/guides/commit-reveal-scheme-solidity.jpg"
---

## TL;DR: Commit-Reveal Scheme in Solidity

- **Front-running attacks** exploit the public nature of blockchain mempools to see and copy profitable transactions before they're executed.
- **Commit-reveal scheme** uses cryptographic hashing to hide player moves during a commit phase, then reveals them in a separate phase.
- **Two-phase process:** Players submit `keccak256(move + secret)` during commit, then reveal the actual move and secret for verification.
- **Essential for fair games:** Prevents attackers from seeing moves in advance and ensures all players compete on equal terms.
- **Best practices:** Use strong random secrets, enforce time deadlines, and follow Checks-Effects-Interactions pattern.

---

## 1. The Front-Running Problem: When Transparency Becomes a Weakness

Blockchain's transparency is both its greatest strength and a critical vulnerability. When you submit for example a transaction to play a dice game or make a move in rock-paper-scissors, that transaction sits in the public **mempool** before being mined.

This creates an exploit opportunity called **front-running**:

1. **Alice submits:** `play(4)` to guess 4 in a dice game
2. **Bob monitors mempool:** Sees Alice's transaction with guess = 4
3. **Bob simulates:** Runs the game logic locally to see if 4 wins
4. **If Alice wins:** Bob copies her transaction with a higher gas fee
5. **Bob gets priority:** Miners process Bob's transaction first, Bob wins the prize

**The core issue:** Alice's "hidden information" isn't actually hidden. The moment her transaction enters the mempool, it becomes public knowledge.

This breaks any game requiring hidden information:

- **Dice games:** Attackers copy winning guesses
- **Rock-Paper-Scissors:** See opponent's move before playing
- **Sealed auctions:** Copy and slightly outbid others
- **Trivia contests:** Copy correct answers with higher gas

---

## 2. The Commit-Reveal Solution: Cryptographic Hide and Seek

The commit-reveal scheme solves front-running by creating temporary privacy on a public blockchain. It works in two phases:

### Phase 1: Commit (Hide Your Move)

Instead of submitting your actual move, you submit a cryptographic commitment:

```solidity
// Don't submit this:
play(4)  // Everyone can see you guessed 4

// Submit this instead:
bytes32 commitment = keccak256(abi.encodePacked(4, secret));
commit(commitment)  // Nobody knows what's inside the hash
```

**Key components:**

- **Your move:** The actual guess/choice (e.g., 4)
- **Secret salt:** A random value only you know
- **Hash function:** `keccak256` creates an irreversible commitment

### Phase 2: Reveal (Show Your Hand)

After the commit phase ends, you reveal your original inputs:

```solidity
reveal(4, secret)  // Now submit the actual move and secret
```

The contract verifies your reveal matches your commitment:

```solidity
bytes32 reconstructed = keccak256(abi.encodePacked(4, secret));
require(reconstructed == storedCommitment, "Invalid reveal");
```

**Why this works:** By the time moves are revealed, it's too late for attackers to submit their own commitments. The commit phase is over.

---

## 3. Core Implementation Pattern

The commit-reveal scheme follows a standard two-phase contract structure that can be adapted for various applications.

### Basic Contract Structure

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CommitRevealBase {
    uint256 public commitDeadline;
    uint256 public revealDeadline;
    uint256 public constant STAKE_AMOUNT = 0.01 ether;
    uint256 public constant PRIZE_AMOUNT = 0.02 ether;

    struct Commitment {
        bytes32 commitmentHash;
        uint256 commitTime;
        bool revealed;
    }

    mapping(address => Commitment) public commitments;

    event Committed(address indexed user, bytes32 commitment);
    event Revealed(address indexed user, uint256 guess, uint256 result, bool won);

    // Custom errors for gas efficiency
    error CommitPhaseClosed();
    error AlreadyCommitted();
    error InsufficientStake();
    error TransferFailed();

    constructor(uint256 commitDuration, uint256 revealDuration) {
        commitDeadline = block.timestamp + commitDuration;
        revealDeadline = commitDeadline + revealDuration;
    }

    function commit(bytes32 _commitment) external payable {
        // === CHECKS ===
        // All validations happen first
        if (block.timestamp >= commitDeadline) revert CommitPhaseClosed();
        if (commitments[msg.sender].commitTime != 0) revert AlreadyCommitted();
        if (msg.value != STAKE_AMOUNT) revert InsufficientStake();

        // === EFFECTS ===
        // State changes happen only after all checks pass
        commitments[msg.sender] = Commitment({
            commitmentHash: _commitment,
            commitTime: block.timestamp,
            revealed: false
        });

        // === INTERACTIONS ===
        // External calls and events happen last
        emit Committed(msg.sender, _commitment);
    }
}
```

**Why CEI matters:** This pattern prevents reentrancy attacks by ensuring state changes occur before external interactions that could call back into the contract.

**Why custom errors matter:** Using `if + revert + custom errors` instead of `require` with strings provides significant gas savings (~200-300 gas per revert) and better error handling. Custom errors are also more descriptive and can include parameters for debugging.

**⚠️ Critical Security Note:** The commitment hash must be generated **off-chain** (we'll show how in Section 4). If you generate the commitment on-chain, both the secret and guess will be immediately visible in the transaction data, defeating the entire purpose of the commit-reveal scheme!

### Generic Reveal Function

```solidity
// Additional custom errors for reveal function
error CommitPhaseNotOver();
error RevealPhaseOver();
error NoCommitmentFound();
error AlreadyRevealed();
error InvalidReveal();

function reveal(uint256 _guess, bytes32 _secret) external {
    // === CHECKS ===
    if (block.timestamp < commitDeadline) revert CommitPhaseNotOver();
    if (block.timestamp >= revealDeadline) revert RevealPhaseOver();

    Commitment storage commitment = commitments[msg.sender];
    if (commitment.commitTime == 0) revert NoCommitmentFound();
    if (commitment.revealed) revert AlreadyRevealed();

    // Verify the reveal matches the commitment
    bytes32 hash = keccak256(abi.encodePacked(_guess, _secret));
    if (hash != commitment.commitmentHash) revert InvalidReveal();

    // === EFFECTS ===
    // Critical: Mark as revealed FIRST to prevent reentrancy
    commitment.revealed = true;

    // ⚠️  RANDOMNESS WARNING ⚠️
    // This randomness method is NOT secure for production!
    // Miners can manipulate block.timestamp to influence outcomes
    uint256 result = (uint256(keccak256(abi.encodePacked(
        block.timestamp, msg.sender, _secret
    ))) % 6) + 1;

    bool won = (_guess == result);

    // === INTERACTIONS ===
    if (won) {
        // Use .call for Ether transfers (safer than .transfer)
        (bool sent, ) = msg.sender.call{value: PRIZE_AMOUNT}("");
        if (!sent) revert TransferFailed();
    }

    emit Revealed(msg.sender, _guess, result, won);
}
```

**🔥 Critical Security Note:** The randomness generation shown above is vulnerable to miner manipulation. For production applications handling real value, use **Chainlink VRF** or similar verifiable random functions.

---

## 4. Frontend Integration: Managing Secrets Securely

The client-side application must handle secret generation and storage:

### Generating Cryptographically Strong Secrets

```javascript
// DON'T use Math.random() for production!
function generateSecret() {
  // Use cryptographically secure random generation
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return "0x" + Array.from(array, byte => byte.toString(16).padStart(2, "0")).join("");
}

// Create commitment
function createCommitment(guess, secret) {
  return ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "bytes32"], [guess, secret]));
}
```

### Managing User State

```javascript
// Store user's commitment data
function saveCommitment(guess, secret, commitment) {
  const data = {
    guess,
    secret,
    commitment,
    timestamp: Date.now(),
  };
  localStorage.setItem("diceCommitment", JSON.stringify(data));

  // ⚠️ Security warning: localStorage is vulnerable to XSS attacks
  // For production: consider encrypted storage or warn users about browser data
}

// Retrieve for reveal phase
function getCommitment() {
  const data = localStorage.getItem("diceCommitment");
  return data ? JSON.parse(data) : null;
}

// UX Enhancement: Auto-reveal with user confirmation
async function autoReveal() {
  const commitment = getCommitment();
  if (!commitment) return;

  // Check if reveal phase is active
  const now = Date.now() / 1000;
  const contract = getContract();
  const revealDeadline = await contract.revealDeadline();

  if (now < revealDeadline) {
    // Prompt user to complete reveal
    const shouldReveal = confirm("Ready to reveal your move? You have a pending commitment.");
    if (shouldReveal) {
      await revealMove(commitment.guess, commitment.secret);
    }
  }
}
```

### UX Challenges & Solutions

**The Two-Transaction Problem:** Commit-reveal inherently requires users to make two separate transactions, creating friction:

**Problems:**

- Higher gas costs (2x transactions)
- Increased cognitive load
- Risk of users forgetting to reveal

**Solutions:**

- **Clear UI guidance:** Step-by-step progress indicators
- **Automated reminders:** Browser notifications when reveal window opens
- **State persistence:** Save commitment data to guide users back
- **Gas estimation:** Show total cost upfront (commit + reveal)

---

## 5. Security Best Practices & Common Pitfalls

### Time-Lock Enforcement is Critical

```solidity
// Always enforce deadlines strictly
if (block.timestamp >= commitDeadline) revert CommitPhaseClosed();
if (block.timestamp < commitDeadline) revert CommitPhaseNotOver();
if (block.timestamp >= revealDeadline) revert RevealPhaseOver();
```

### Handle Unrevealed Commitments

Players might commit but never reveal. Design for this systematically:

```solidity
// Track game state and handle edge cases
enum GameState { Committing, Revealing, Finished, Cancelled }
GameState public gameState;

mapping(address => bool) public hasRevealed;
address[] public allPlayers;
uint256 public revealedCount;

function handleUnrevealedCommitments() external {
    require(block.timestamp > revealDeadline, "Reveal period active");
    require(gameState == GameState.Revealing, "Not in reveal phase");

    if (revealedCount == 0) {
        // Nobody revealed - refund all stakes
        gameState = GameState.Cancelled;
        for (uint i = 0; i < allPlayers.length; i++) {
            _refundStake(allPlayers[i]);
        }
    } else if (revealedCount < allPlayers.length) {
        // Some didn't reveal - forfeit their stakes to prize pool
        gameState = GameState.Finished;
        _distributePrizes();
    }
}

// Internal helper functions
function _refundStake(address player) internal {
    (bool sent, ) = player.call{value: STAKE_AMOUNT}("");
    require(sent, "Refund failed");
}

function _distributePrizes() internal {
    // Prize distribution logic - implementation depends on game rules
    // Example: distribute to revealed players proportionally
}

// Emergency functions for edge cases
function emergencyWithdraw() external {
    require(block.timestamp > revealDeadline + 7 days, "Too early");
    require(!hasRevealed[msg.sender], "Already revealed");

    // Allow unrevealed players to claim stakes after extended period
    Commitment storage commitment = commitments[msg.sender];
    require(commitment.commitTime != 0, "No commitment");

    // Partial refund (minus penalty)
    uint256 refund = STAKE_AMOUNT * 80 / 100;  // 80% refund
    commitment.commitTime = 0;  // Mark as withdrawn

    (bool sent, ) = msg.sender.call{value: refund}("");
    require(sent, "Transfer failed");
}
```

### Error Handling Strategies

```solidity
// Custom errors with parameters for better debugging
error InsufficientStake(uint256 provided, uint256 required);
error ExcessPayment(uint256 excess);

function commit(bytes32 _commitment) external payable {
    if (block.timestamp >= commitDeadline) revert CommitPhaseClosed();
    if (commitments[msg.sender].commitTime != 0) revert AlreadyCommitted();

    // Handle payment validation with detailed error information
    if (msg.value < STAKE_AMOUNT) {
        revert InsufficientStake(msg.value, STAKE_AMOUNT);
    } else if (msg.value > STAKE_AMOUNT) {
        // Refund excess payment
        uint256 excess = msg.value - STAKE_AMOUNT;
        (bool sent, ) = msg.sender.call{value: excess}("");
        if (!sent) revert TransferFailed();
        revert ExcessPayment(excess);
    }

    // Continue with commit logic...
}
```

### Salt Security Requirements

- **Strong randomness:** Use `window.crypto.getRandomValues()` in browsers
- **Sufficient entropy:** At least 32 bytes of random data
- **Unique per commitment:** Never reuse the same secret
- **Secure storage:** Protect secrets between commit and reveal phases

### Gas Optimization Tips

```solidity
// Pack struct efficiently to save storage slots
struct Commitment {
    bytes32 solutionHash;  // 32 bytes (slot 1)
    uint32 commitTime;     // 4 bytes
    bool revealed;         // 1 byte
    // Total: 37 bytes fits in 2 storage slots vs 3 with uint256
}

// Use constants for repeated values
uint256 public constant STAKE_AMOUNT = 0.01 ether;
uint256 public constant MIN_COMMIT_DURATION = 1 hours;

mapping(address => Commitment) public commitments;

// Batch operations when possible
// Additional custom errors for batch operations
error LengthMismatch();
error IncorrectTotalStake();

function batchCommit(bytes32[] calldata commitmentHashes, address[] calldata players)
    external payable
{
    if (commitmentHashes.length != players.length) revert LengthMismatch();
    if (msg.value != STAKE_AMOUNT * players.length) revert IncorrectTotalStake();

    for (uint256 i = 0; i < commitmentHashes.length; i++) {
        // Individual commit logic without redundant checks
        commitments[players[i]] = Commitment({
            solutionHash: commitmentHashes[i],
            commitTime: uint32(block.timestamp),
            revealed: false
        });
    }
}
```

**Storage Optimization Benefits:**

- **37 bytes** in optimized struct vs **65 bytes** in naive version
- Saves ~**43% storage costs** per commitment
- Example (Ethereum mainnet): For 1000 players it could represent **~$125–250 saved** (at 5–10 gwei). Actual savings vary with gas and ETH price.

---

## 6. Advanced Patterns & Variations

### Multi-Player Games

For games with multiple players, wait for all commits before revealing:

```solidity
uint256 public playerCount;
uint256 public commitCount;
mapping(address => bool) public hasCommitted;

function commit(bytes32 _commitment) external payable {
    if (hasCommitted[msg.sender]) revert AlreadyCommitted();
    // ... standard commit logic ...

    commitCount++;
    hasCommitted[msg.sender] = true;

    // Auto-advance phase when all players commit
    if (commitCount == playerCount) {
        commitDeadline = block.timestamp;
    }
}
```

### Batch Processing

For large-scale applications, consider batch reveal processing:

```solidity
function batchReveal(
    uint256[] calldata guesses,
    bytes32[] calldata secrets,
    address[] calldata players
) external {
    require(guesses.length == secrets.length, "Array length mismatch");
    require(guesses.length == players.length, "Array length mismatch");

    for (uint256 i = 0; i < guesses.length; i++) {
        _processReveal(players[i], guesses[i], secrets[i]);
    }
}
```

---

## 7. Development Environment Setup

### Quick Start: Browser-Based Development

**Remix IDE** (recommended for beginners):

- Zero installation required
- Built-in compiler and debugger
- Deploy directly to testnets
- Perfect for learning and prototyping

```solidity
// Always lock pragma version for security
pragma solidity ^0.8.20;  // ✅ Good: specific version
// pragma solidity >=0.8.0;  // ❌ Bad: floating pragma
```

### Production Development

**Hardhat** (JavaScript/TypeScript ecosystem):

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
```

**Foundry** (Rust-based, faster compilation):

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
forge init my-commit-reveal-game
```

**Scaffold-ETH 2** (Modern full-stack dapp toolkit):

```bash
npx create-eth@latest commit-reveal-game
cd commit-reveal-game

```

And then the 3 magic commands to start the chain, deploy the contract and start the frontend (in 3 different terminals):

```bash
yarn chain
yarn deploy
yarn start
```

Key benefits for this guide:

- Out-of-the-box local chain, deploy scripts, and UI components
- First-class custom [hooks](https://docs.scaffoldeth.io/hooks/) for reading/writing to contracts (wagmi/viem wrappers)
- Easy place to add your contract at `packages/hardhat/contracts/CommitReveal.sol`
- Next.js frontend ready to wire `commit()` and `reveal()` in Debug page for quick iteration.

**Key differences:**

- **Remix:** Browser-based, instant setup, great for learning
- **Hardhat:** Mature JS ecosystem, extensive plugin support
- **Foundry:** Faster compilation, Solidity-native testing, gas optimization tools
- **Scaffold-ETH 2:** An open-source, up-to-date toolkit for building dapps on EVM chains with different extensions (starter kits)

---

## 8. Real-World Applications Beyond Games

### Sealed-Bid Auctions

```solidity
// Bidders commit to bids without revealing amounts
function commitBid(bytes32 _bidCommitment) external payable {
    // Require deposit to prevent spam
    require(msg.value >= minimumDeposit, "Insufficient deposit");
    commitments[msg.sender] = _bidCommitment;
}

function revealBid(uint256 _bidAmount, bytes32 _secret) external {
    bytes32 hash = keccak256(abi.encodePacked(_bidAmount, _secret));
    require(hash == commitments[msg.sender], "Invalid bid reveal");
    // Process bid logic...
}
```

### Voting Systems

```solidity
// Voters commit to choices without revealing preferences
function commitVote(bytes32 _voteCommitment) external {
    require(isEligibleVoter[msg.sender], "Not eligible to vote");
    commitments[msg.sender] = _voteCommitment;
}

function revealVote(uint256 _choice, bytes32 _secret) external {
    bytes32 hash = keccak256(abi.encodePacked(_choice, _secret));
    require(hash == commitments[msg.sender], "Invalid vote reveal");
    votes[_choice]++;
}
```

---

## 9. Testing Your Implementation

### Key Test Scenarios

```solidity
contract CommitRevealTest {
    function testBasicFlow() public {
        // 1. Multiple players commit
        // 2. Verify commits are stored correctly
        // 3. Reveal phase processes correctly
        // 4. Winners receive prizes
    }

    function testFrontRunningPrevention() public {
        // 1. Player A commits winning move
        // 2. Player B tries to copy (should be impossible)
        // 3. Verify Player B cannot determine Player A's move
    }

    function testTimeEnforcement() public {
        // 1. Test commits rejected after deadline
        // 2. Test reveals rejected before commit deadline
        // 3. Test reveals rejected after reveal deadline
    }

    function testInvalidReveals() public {
        // 1. Test wrong guess/secret combination
        // 2. Test revealing without committing
        // 3. Test double reveals
    }
}
```

---

## 10. Computer Science Context: Two-Phase Commit Connection

The commit-reveal scheme shares conceptual DNA with the **Two-Phase Commit (2PC)** protocol from distributed systems:

### Distributed Systems Parallel

**Traditional 2PC (Database Systems):**

1. **Prepare Phase:** Coordinator asks all nodes "Are you ready to commit?"
2. **Commit Phase:** If all agree, coordinator sends "Commit!" to all nodes

**Blockchain Commit-Reveal:**

1. **Commit Phase:** All players submit cryptographic "promises" to their moves
2. **Reveal Phase:** Players execute their promised moves simultaneously

### Why This Matters

Understanding this connection helps developers:

- **Reason about coordination:** Both solve consensus problems in distributed environments
- **Handle failure modes:** What happens when participants don't respond?
- **Design atomic operations:** Ensure all-or-nothing execution across multiple parties

```solidity
// Atomic game state transition - all reveals or none
function batchReveal(RevealData[] calldata reveals) external {
    // Verify ALL reveals before changing ANY state
    for (uint i = 0; i < reveals.length; i++) {
        require(verifyReveal(reveals[i]), "Invalid reveal");
    }

    // Only after all verifications pass, update state
    for (uint i = 0; i < reveals.length; i++) {
        processReveal(reveals[i]);
    }
}
```

This isn't just a "Solidity trick" - it's applying fundamental distributed systems principles to blockchain coordination problems.

---

## 11. Alternatives to Commit-Reveal

While commit-reveal is the most common solution, other approaches exist:

### Private Mempools

Services like **Flashbots** allow transactions to bypass the public mempool:

- **Pros:** Simpler than commit-reveal, no two-phase requirement
- **Cons:** Introduces centralization, requires external service

### Zero-Knowledge Proofs

Advanced cryptographic techniques for hiding information:

- **Pros:** Can hide complex game state, not just single moves
- **Cons:** Much more complex to implement, higher gas costs

### Threshold Cryptography

Multi-party computation for generating randomness:

- **Pros:** Decentralized randomness generation
- **Cons:** Requires multiple participants, complex coordination

---

## 12. Conclusion: Building Fair Blockchain Games

The commit-reveal scheme is essential for any blockchain application requiring hidden information. While it adds complexity with its two-phase approach, it's the most practical solution for preventing front-running attacks.

**Key takeaways:**

- Always use cryptographically strong secrets
- Enforce time deadlines strictly
- Design for unrevealed commitments
- Test thoroughly with adversarial scenarios
- Consider user experience in the two-transaction flow

**The path to mastery:** Theory is just the beginning. The best way to understand commit-reveal is to implement it. Start with a simple dice game, then expand to more complex applications.

---

**Ready to build? [Try the Dice Game Challenge!](/challenge/dice-game)**

**Want to learn more about blockchain security? [Read our Flash Loan Exploits Guide!](/guides/flash-loan-exploits)**
