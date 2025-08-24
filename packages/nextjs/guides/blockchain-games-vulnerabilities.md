---
title: "Blockchain Game Security: Comprehensive Vulnerability Defense Tutorial"
description: "Master blockchain game security with this comprehensive tutorial to smart contract vulnerabilities, randomness exploits, and defense patterns. Includes Solidity examples and real-world attack scenarios for Web3 developers."
image: "/assets/guides/blockchain-games-security.jpg"
---

## TL;DR: Blockchain Game Security Essentials

- **Randomness is critical:** Never use `block.timestamp` or `blockhash`, use Chainlink VRF for secure randomness
- **Common vulnerabilities:** Reentrancy, integer overflow, access control flaws, and gas-based DoS attacks
- **Economic exploits:** Front-running, oracle manipulation, and tokenomics instability can destroy games
- **Defense patterns:** Checks-Effects-Interactions (CEI), OpenZeppelin libraries, TWAP oracles, and time-locked governance
- **Real impact:** $625M+ lost to game exploits (Ronin Network, Axie Infinity), highlighting critical security needs

---

## 1. The High-Stakes Reality of Web3 Game Security

Web3 gaming represents a paradigm shift where players truly own in-game assets and participate in decentralized economies. However, this innovation comes with unprecedented security challenges. Unlike traditional games where bugs might cause frustration, blockchain game vulnerabilities can result in permanent, irreversible financial losses.

The scale of the problem is staggering: the $625 million Ronin Network hack supporting Axie Infinity serves as a stark reminder that security failures in Web3 gaming can have catastrophic consequences. In blockchain games, every smart contract function is a potential attack vector, and every economic mechanism must be bulletproof.

**Why Game Security is Different:**

- **Immutable code:** Smart contract bugs can't be patched like traditional software
- **Financial stakes:** In-game assets have real monetary value
- **Public transparency:** All code and transactions are visible to attackers
- **Composability risks:** Integration with DeFi protocols multiplies attack surfaces

### 1.1 The Multi-Layer Security Stack

Web3 game security isn't monolithic—it's a layered system where failure at any level can be catastrophic:

1. **EVM Layer:** Fixed-size integer math can be exploited (overflow/underflow)
2. **Smart Contract Layer:** Code vulnerabilities like reentrancy and access control flaws
3. **Network Layer:** Public mempool enables front-running and MEV attacks
4. **Economic Design Layer:** Poor tokenomics can collapse games regardless of code quality
5. **Infrastructure Layer:** Cross-chain bridges and key management vulnerabilities

The most devastating attacks often combine vulnerabilities across multiple layers. The $625M Ronin hack wasn't a smart contract bug—it combined social engineering (human layer), compromised validator keys (infrastructure layer), and economic devastation (economic layer).

---

## 2. The Randomness Problem: Your First Security Challenge

### 2.1 The Fundamental Flaw

Most blockchain games need randomness for dice rolls, card draws, loot drops, or procedural generation. The instinct is to use on-chain data like `block.timestamp`, but this creates a critical vulnerability.

**Why On-Chain Randomness Fails:**

- All blockchain data is public and predictable
- Miners/validators can manipulate block properties
- Transactions are visible in the mempool before execution

### 2.2 Vulnerable Dice Game Example

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

// WARNING: This contract is vulnerable. DO NOT USE.
contract VulnerableDiceGame {
    constructor() payable {}

    function rollDice() external payable {
        require(msg.value == 0.01 ether, "Bet must be 0.01 ether");

        // VULNERABLE: Using block.timestamp for randomness
        uint256 roll = block.timestamp % 6 + 1;

        if (roll == 6) { // Player wins only on 6 (16.67% chance)
            (bool sent, ) = msg.sender.call{value: msg.value * 2}("");
            require(sent, "Failed to send Ether");
        }
    }
}
```

### 2.3 Step-by-Step Attack Scenario

**The Rigged Dice Game Attack:**

1. **Transaction Creation:** Attacker creates a transaction calling `rollDice()` with 1 ETH
2. **Mempool Visibility:** Transaction enters public mempool where miners can see it
3. **Outcome Calculation:** Miner calculates: `block.timestamp % 6 + 1` for potential blocks
4. **Selective Mining:** Miner only includes the transaction in blocks where `roll <= 3` (winning condition)
5. **Guaranteed Profit:** Attacker wins the contract balance risk-free

This transforms a "game of chance" into a deterministic profit engine for miners/validators.

For a deeper understanding of why blockchain randomness is fundamentally challenging and the various approaches to solve it, see: **[Secure Randomness in Solidity: Beyond Block Variables](/guides/blockchain-randomness-solidity)**

### 2.4 Secure Solution: Chainlink VRF

For a complete Chainlink VRF implementation with detailed setup instructions, deployment scripts, and advanced patterns, see our dedicated guide: **[Chainlink VRF Implementation: Provably Fair Randomness for Smart Contracts](/guides/chainlink-vrf-solidity-games)**

**Key Security Benefits:**

- **Provably Fair:** Cryptographic proofs ensure randomness integrity
- **Manipulation-Resistant:** Neither validators nor oracles can bias results
- **Production-Ready:** Used by major DeFi protocols and gaming platforms

---

## 3. Core Smart Contract Vulnerabilities in Games

### 3.1 Reentrancy: The Classic Exploit

**The Risk:** Functions that make external calls before updating state can be exploited through recursive calls.

**Game Impact:** Duplicate reward claims, infinite item minting, or treasury drainage.

```solidity
// VULNERABLE: Reentrancy attack vector
function claimReward() public {
    uint256 reward = rewards[msg.sender];
    require(reward > 0, "No reward");

    // DANGEROUS: External call before state update
    (bool success, ) = msg.sender.call{value: reward}("");
    require(success);

    rewards[msg.sender] = 0; // TOO LATE
}

// SECURE: Checks-Effects-Interactions pattern
function claimReward() public nonReentrant {
    uint256 reward = rewards[msg.sender];
    require(reward > 0, "No reward");

    // Update state FIRST
    rewards[msg.sender] = 0;

    // Then make external call
    (bool success, ) = msg.sender.call{value: reward}("");
    require(success);
}
```

### 3.2 Integer Overflow/Underflow

**The Risk:** Arithmetic operations that exceed variable limits can wrap around to unexpected values.

**Game Impact:** Players could underflow their item count to gain unlimited items.

```solidity
// VULNERABLE (Solidity < 0.8.0)
function useHealthPotion() public {
    require(healthPotions[msg.sender] > 0);
    healthPotions[msg.sender] -= 1; // Could underflow to max value
    health[msg.sender] += 50;
}

// SECURE: Use Solidity 0.8.0+ (built-in overflow protection)
// or SafeMath for older versions
function useHealthPotion() public {
    require(healthPotions[msg.sender] > 0, "No potions");
    healthPotions[msg.sender] -= 1; // Reverts on underflow
    health[msg.sender] += 50;
}
```

### 3.3 Access Control Failures

**The Risk:** Missing or incorrect permission checks allow unauthorized actions.

```solidity
// VULNERABLE: Missing access control
function mintRareNFT(address to) public {
    _mint(to, nextTokenId++); // Anyone can mint!
}

// SECURE: Proper access control
import "@openzeppelin/contracts/access/Ownable.sol";

contract SecureGame is Ownable {
    uint256 public nextTokenId = 1;

    constructor(address initialOwner) Ownable(initialOwner) {}

    function mintRareNFT(address to) public onlyOwner {
        _mint(to, nextTokenId++);
    }
}
```

### 3.4 Gas-Based Denial of Service

**The Risk:** Unbounded loops can exceed block gas limits, making functions uncallable.

```solidity
// VULNERABLE: Unbounded loop
function distributeRewards() external {
    for (uint i = 0; i < players.length; i++) {
        // Could run out of gas if too many players
        payable(players[i]).transfer(rewards[players[i]]);
    }
}

// SECURE: Pull-over-Push pattern
function claimReward() external {
    uint256 reward = rewards[msg.sender];
    require(reward > 0, "No reward");
    rewards[msg.sender] = 0;
    payable(msg.sender).transfer(reward);
}
```

---

## 4. Economic and Strategic Exploits

### 4.1 Front-Running Attacks

**The Vulnerability:** Transparent mempools allow attackers to see and front-run profitable transactions.

**Game-Specific Attack Scenarios:**

1. **NFT Mint Sniping:** During anticipated NFT drops, attackers monitor mempool for minting transactions. If NFT traits are determined at mint time based on on-chain variables, attackers can front-run transactions that would result in rare NFTs, stealing valuable assets.

2. **Turn-Based Strategy Exploitation:** In blockchain strategy games, player moves are transactions. Opponents can see moves in the mempool and submit counter-moves with higher gas fees, gaining unfair strategic advantages.

3. **Marketplace Sniping:** When players mistakenly list valuable items at low prices, front-running bots immediately submit purchase transactions, buying items before legitimate buyers can react.

**Mitigation: Commit-Reveal Schemes**

```solidity
contract SecureCardGame {
    struct Commitment {
        bytes32 hash;
        uint256 commitBlock;
        bool revealed;
    }

    mapping(address => Commitment) public commitments;
    mapping(uint256 => bool) public usedNonces;

    uint256 public constant COMMIT_DURATION = 10; // blocks
    uint256 public constant REVEAL_DURATION = 5;  // blocks

    function commitMove(bytes32 commitment) external {
        commitments[msg.sender] = Commitment({
            hash: commitment,
            commitBlock: block.number,
            revealed: false
        });
    }

    function revealMove(uint8 move, uint256 nonce) external {
        Commitment storage commitment = commitments[msg.sender];
        require(commitment.hash != bytes32(0), "No commitment");
        require(!commitment.revealed, "Already revealed");
        require(!usedNonces[nonce], "Nonce already used");
        require(block.number >= commitment.commitBlock + COMMIT_DURATION, "Commit phase not ended");
        require(block.number <= commitment.commitBlock + COMMIT_DURATION + REVEAL_DURATION, "Reveal phase ended");

        bytes32 hash = keccak256(abi.encodePacked(move, nonce, msg.sender));
        require(hash == commitment.hash, "Invalid reveal");

        commitment.revealed = true;
        usedNonces[nonce] = true;
        // Process the move...
    }
}
```

### 4.2 Oracle Manipulation

**The Risk:** Games using price oracles can be manipulated through flash loans or large trades.

**Defense: Time-Weighted Average Price (TWAP)**

```solidity
interface IUniswapV2Pair {
    function getReserves() external view returns (uint112, uint112, uint32);
    function price0CumulativeLast() external view returns (uint256);
    function price1CumulativeLast() external view returns (uint256);
}

contract SecurePriceOracle {
    struct Observation {
        uint32 blockTimestamp;
        uint224 price0Cumulative;
        uint224 price1Cumulative;
        bool initialized;
    }

    mapping(address => Observation[]) public pairObservations;
    uint256 public constant MIN_OBSERVATIONS = 2;
    uint256 public constant MAX_AGE = 1 hours;

    function updateObservation(address pair) external {
        uint256 price0Cumulative = IUniswapV2Pair(pair).price0CumulativeLast();
        uint256 price1Cumulative = IUniswapV2Pair(pair).price1CumulativeLast();

        pairObservations[pair].push(Observation({
            blockTimestamp: uint32(block.timestamp),
            price0Cumulative: uint224(price0Cumulative),
            price1Cumulative: uint224(price1Cumulative),
            initialized: true
        }));
    }

    function getTWAP(address pair, uint32 period) external view returns (uint256) {
        Observation[] storage observations = pairObservations[pair];
        require(observations.length >= MIN_OBSERVATIONS, "Insufficient observations");

        Observation memory latest = observations[observations.length - 1];
        require(block.timestamp - latest.blockTimestamp <= MAX_AGE, "Data too stale");

        // Find observation from `period` seconds ago
        Observation memory historical = observations[observations.length - 2];
        for (uint i = observations.length - 1; i > 0; i--) {
            if (latest.blockTimestamp - observations[i].blockTimestamp >= period) {
                historical = observations[i];
                break;
            }
        }

        uint32 timeElapsed = latest.blockTimestamp - historical.blockTimestamp;
        require(timeElapsed >= period, "Insufficient time elapsed");

        return (latest.price0Cumulative - historical.price0Cumulative) / timeElapsed;
    }
}
```

### 4.3 Economic Collapse: Real-World Case Studies

#### Case Study 1: Axie Infinity - The Economic Death Spiral

**The Setup:** Axie Infinity became a global phenomenon, with players in developing countries earning significant income during COVID-19. However, its economy was fundamentally flawed.

**The Vulnerability:** The game's economy relied on hyperinflation of Smooth Love Potion (SLP) tokens. Players earned SLP through battles, but the primary "sink" was breeding new Axies. This created a Ponzi-like structure dependent on constant new player growth.

**The Collapse:**

1. **Peak Hype:** SLP reached $0.40+ with massive demand for new Axies
2. **Player Growth Slows:** New player acquisition stagnated, reducing Axie breeding demand
3. **Economic Death Spiral:** SLP supply far exceeded demand, crashing from $0.40 to under $0.01
4. **Exploitation System:** High entry costs led to "scholarship" systems where asset owners exploited players for their earnings

**The Impact:** The game transformed from "play-to-earn" into "grind-to-survive," with SLP losing over 99% of its value and billions in market capitalization. This demonstrates how economic design flaws can be more devastating than code vulnerabilities.

#### Case Study 2: DeFi Kingdoms - The $6.5M Logic Flaw

**The Vulnerability:** A smart contract flaw allowed players to use multiple accounts to manipulate the rate at which they could mine locked JEWEL tokens.

**The Exploit:**

1. Players discovered they could create multiple accounts
2. Each account could unfairly increase mining rates
3. This released more tokens than the economic model anticipated
4. Unintended inflationary pressure crashed JEWEL's price

**The Lesson:** Even technically sophisticated projects can suffer massive losses when code-level vulnerabilities trigger economic exploits.

---

## 5. Developer Security Checklist

### 5.1 Essential Security Patterns

<table>
  <thead>
    <tr>
      <th>Vulnerability</th>
      <th>Defense Pattern</th>
      <th>Implementation</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Reentrancy</td>
      <td>Checks-Effects-Interactions</td>
      <td>OpenZeppelin's <code>ReentrancyGuard</code></td>
    </tr>
    <tr>
      <td>Integer Overflow</td>
      <td>Safe Math</td>
      <td>Solidity 0.8.0+ or SafeMath</td>
    </tr>
    <tr>
      <td>Access Control</td>
      <td>Role-Based Permissions</td>
      <td>OpenZeppelin's <code>Ownable</code> or <code>AccessControl</code></td>
    </tr>
    <tr>
      <td>Bad Randomness</td>
      <td>External Oracles</td>
      <td>Chainlink VRF</td>
    </tr>
    <tr>
      <td>Front-Running</td>
      <td>Commit-Reveal</td>
      <td>Two-phase transactions</td>
    </tr>
    <tr>
      <td>Oracle Manipulation</td>
      <td>TWAP or Multi-Source</td>
      <td>Chainlink Price Feeds</td>
    </tr>
  </tbody>
</table>

### 5.2 Security Best Practices

1. **Use Battle-Tested Libraries**

   - OpenZeppelin for standard contracts
   - Chainlink for oracles and randomness
   - Never reinvent security-critical components

2. **Implement Defense in Depth**

   - Multiple layers of security checks
   - Circuit breakers for emergency stops
   - Time-locked governance for critical changes

3. **Comprehensive Testing**

   - Unit tests for all functions
   - Integration tests with attack scenarios
   - Professional security audits before mainnet

4. **Monitor and Respond**
   - Event logging for suspicious activity
   - Pause mechanisms for detected threats
   - Bug bounty programs for ongoing security

### 5.3 Advanced Mitigation Strategies

#### Batch Auctions for Front-Running Protection

Instead of first-come-first-served transaction processing, collect all transactions within a time window and process them simultaneously:

```solidity
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BatchAuctionNFT is ERC721 {
    struct Bid {
        address bidder;
        uint256 amount;
    }

    mapping(uint256 => Bid[]) public roundBids;
    mapping(uint256 => mapping(address => uint256)) public bidderRefunds;
    uint256 public currentRound = 1;
    uint256 public constant ROUND_DURATION = 1 hours;
    uint256 public roundStartTime;

    constructor() ERC721("BatchAuctionNFT", "BATCH") {
        roundStartTime = block.timestamp;
    }

    function submitBid() external payable {
        require(msg.value > 0, "Bid must be positive");
        require(block.timestamp < roundStartTime + (currentRound * ROUND_DURATION), "Round ended");

        roundBids[currentRound].push(Bid({
            bidder: msg.sender,
            amount: msg.value
        }));
    }

    function processRound() external {
        require(block.timestamp >= roundStartTime + (currentRound * ROUND_DURATION), "Round not ended");

        Bid[] storage bids = roundBids[currentRound];
        require(bids.length > 0, "No bids");

        // Find highest bidder
        uint256 highestBid = 0;
        address winner;
        for (uint i = 0; i < bids.length; i++) {
            if (bids[i].amount > highestBid) {
                highestBid = bids[i].amount;
                winner = bids[i].bidder;
            }
        }

        // Setup refunds for losing bidders
        for (uint i = 0; i < bids.length; i++) {
            if (bids[i].bidder != winner) {
                bidderRefunds[currentRound][bids[i].bidder] = bids[i].amount;
            }
        }

        // Mint NFT to winner
        _mint(winner, currentRound);
        currentRound++;
    }

    function claimRefund(uint256 round) external {
        uint256 refund = bidderRefunds[round][msg.sender];
        require(refund > 0, "No refund available");

        bidderRefunds[round][msg.sender] = 0;
        payable(msg.sender).transfer(refund);
    }
}
```

#### Economic Audits and Game Theory Analysis

Before launching, engage specialized firms to conduct economic modeling:

1. **Stress Testing:** Simulate various player strategies and market conditions
2. **Game Theory Analysis:** Identify Nash equilibriums that could harm the game
3. **Token Flow Modeling:** Ensure sustainable faucet/sink balance
4. **Inflation Scenario Planning:** Model different growth and adoption curves

#### Formal Verification for Critical Components

For high-value functions, use mathematical proofs to verify correctness:

```solidity
// Example: Formally verified reward calculation
function calculateReward(uint256 stakeAmount, uint256 duration)
    external pure returns (uint256) {
    // @notice: Formally verified to never overflow
    // @invariant: result <= stakeAmount * MAX_MULTIPLIER
    require(stakeAmount > 0, "Invalid stake");
    require(duration <= MAX_DURATION, "Duration too long");

    return (stakeAmount * duration * REWARD_RATE) / PRECISION;
}
```

#### Bug Bounty Programs

Establish ongoing security incentives on platforms like **Immunefi** or **HackenProof**:

- **Critical vulnerabilities:** $50K-$1M+ rewards
- **Responsible disclosure:** 90-day disclosure timeline
- **Scope definition:** Clear boundaries of what's in/out of scope
- **Escalation procedures:** Direct lines to development team

---

## 6. Real-World Impact: Learning from Major Exploits

### 6.1 Notable Game Exploits

<table>
  <thead>
    <tr>
      <th>Protocol</th>
      <th>Date</th>
      <th>Loss</th>
      <th>Primary Vulnerability</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Ronin Network</td>
      <td>Mar 2022</td>
      <td>$625M</td>
      <td>Bridge key compromise</td>
    </tr>
    <tr>
      <td>Axie Infinity</td>
      <td>2021-2022</td>
      <td>$45M+</td>
      <td>Economic design flaws</td>
    </tr>
    <tr>
      <td>DeFi Kingdoms</td>
      <td>2022</td>
      <td>$6.5M</td>
      <td>Logic flaw in mining</td>
    </tr>
    <tr>
      <td>Gods Unchained</td>
      <td>2019</td>
      <td>$500K+</td>
      <td>Card duplication exploit</td>
    </tr>
  </tbody>

</table>

### 6.2 Key Lessons

- **Infrastructure matters:** The Ronin hack targeted bridge security, not game contracts
- **Economic design is security:** Poor tokenomics can be as devastating as code bugs
- **Composability amplifies risk:** DeFi integrations multiply potential attack vectors

### 6.3 Case Study: DeFi Kingdoms Mining Exploit - The $6.5M Logic Flaw

**The Setup:** DeFi Kingdoms was a blockchain game combining DeFi mechanics with NFT-based gameplay, where players could mine JEWEL tokens through various activities.

**The Vulnerability:** A smart contract flaw in the mining mechanism allowed players to manipulate the rate at which they could mine locked JEWEL tokens through multiple account exploitation.

**The Attack Sequence:**

1. **Multiple Account Creation:** Attackers discovered they could create numerous accounts
2. **Rate Manipulation:** Each account unfairly increased mining rates beyond intended limits
3. **Token Inflation:** This released more JEWEL tokens than the economic model anticipated
4. **Economic Collapse:** Unintended inflationary pressure crashed JEWEL's price from $20+ to under $1

**The Impact:** The exploit demonstrated how technical vulnerabilities in blockchain games can trigger cascading economic failures, affecting both the game's tokenomics and player confidence.

**The Defense: Robust Economic Modeling**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/governance/TimelockController.sol";

contract SecureGovernance is TimelockController {
    uint256 public constant MIN_DELAY = 24 hours;
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");

    // Emergency pause functionality
    bool public paused;
    address public emergencyCouncil;

    event EmergencyPause(address indexed pauser);
    event Unpause(address indexed unpauser);

    modifier onlyEmergencyCouncil() {
        require(msg.sender == emergencyCouncil, "Not emergency council");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Contract paused");
        _;
    }

    constructor(
        address[] memory proposers,
        address[] memory executors,
        address admin
    ) TimelockController(MIN_DELAY, proposers, executors, admin) {}

    function setEmergencyCouncil(address _council) external onlyRole(DEFAULT_ADMIN_ROLE) {
        emergencyCouncil = _council;
    }

    function emergencyPause() external onlyEmergencyCouncil {
        paused = true;
        emit EmergencyPause(msg.sender);
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        paused = false;
        emit Unpause(msg.sender);
    }

    // Override to add pause functionality
    function execute(
        address target,
        uint256 value,
        bytes calldata payload,
        bytes32 predecessor,
        bytes32 salt
    ) public payable override whenNotPaused {
        super.execute(target, value, payload, predecessor, salt);
    }
}
```

**Key Governance Security Principles:**

1. **Mandatory Delays:** Minimum 24-48 hour delays for critical changes
2. **Quorum Requirements:** Minimum participation thresholds (10%+ of total supply)
3. **Vote Weight Limits:** Cap maximum voting power any single entity can hold
4. **Time-Decay Voting:** Voting power decreases if tokens are held for too short a time
5. **Emergency Multi-Sig:** Separate emergency council with pause-only powers

---

## 7. Building Secure Games: A Practical Framework

### 7.1 Secure Foundation

- Choose audited libraries (OpenZeppelin)
- Implement proper access controls
- Use Chainlink VRF for randomness

### 7.2 Economic Security

- Design sustainable tokenomics with balanced faucets/sinks
- Implement TWAP oracles and multi-source price feeds
- Plan for time-locked governance with quorum requirements
- Conduct economic modeling and game theory audits

### 7.3 Testing & Auditing

- Comprehensive test coverage
- Professional security audit
- Bug bounty program

### 7.4 Monitoring & Response

- Real-time monitoring
- Emergency response procedures
- Community security education

---

## Wrapping Up: Security as a Core Game Mechanic

In Web3 gaming, security isn't just a technical requirement it's a core game mechanic that affects player trust, asset value, and long-term sustainability. The most successful blockchain games are those that treat security as a first-class concern from day one.

**Remember:**

- Security vulnerabilities in games can cause permanent financial losses
- Use proven patterns and audited libraries
- Test extensively with realistic attack scenarios
- Design economics to be sustainable and manipulation-resistant

Building secure blockchain games requires thinking like both a developer and an attacker. By understanding these vulnerabilities and implementing proper defenses, you can create games that players can trust with their valuable digital assets.

---

**Ready to build secure games? [Try the Dice Game Challenge!](/challenge/dice-game)**

**Want to learn more about DeFi security? [Check out the Flash Loan Exploits Guide!](/guides/flash-loan-exploits)**

**Interested in randomness solutions? [Explore the Chainlink VRF Guide!](/guides/chainlink-vrf-solidity-games)**
