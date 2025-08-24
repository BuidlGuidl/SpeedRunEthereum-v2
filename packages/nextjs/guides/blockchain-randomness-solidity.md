---
title: "Secure Randomness in Solidity: Beyond Block Variables"
description: "Learn why block.timestamp and blockhash fail for randomness in Solidity. Master Chainlink VRF and commit-reveal schemes to build provably fair smart contracts and secure blockchain games."
image: "/assets/guides/blockchain-randomness-solidity.jpg"
---

## TL;DR: Blockchain Randomness in Solidity

- **Block variables** (timestamp, blockhash, prevrandao) are **predictable and manipulable** never use for anything valuable.
- **Chainlink VRF** is the industry standard for provably fair randomness in production applications.
- **Commit-reveal schemes** offer decentralized randomness but require multiple transactions.
- **The core challenge:** Blockchains are deterministic by design, making true randomness impossible on-chain.

---

## 1. Why Randomness is Hard on the Blockchain

Generating secure randomness is one of the most challenging problems in smart contract development. While traditional applications can easily access entropy from system clocks or hardware noise, **blockchains are deterministic by design** every node must compute identical results to maintain consensus.

This fundamental constraint means any randomness derived from on-chain data is inherently **public and predictable**. Understanding this limitation is critical for building secure decentralized applications, especially blockchain games, NFT drops, and lottery systems.

**The PRNG Problem:** Traditional computers use pseudorandom number generators (PRNGs) seeded with high-entropy sources like system clocks or hardware noise. Smart contracts can't access these node-specific values without breaking consensus, forcing reliance on public blockchain data.

### The Determinism Problem

Ethereum's strength is its predictability: every node executing the same transaction must arrive at identical results. This makes **on-chain randomness** an oxymoronany "random" value computable by one node can be computed by all nodes, including attackers.

---

## 2. Common Pitfalls: Why Block Variables Fail

Developers often turn to seemingly unpredictable block variables for randomness. **This is always a mistake.**

### Block.timestamp and Blockhash

```solidity
// NEVER DO THIS - Vulnerable to manipulation
function badRandom() public view returns (uint256) {
    return uint256(keccak256(abi.encodePacked(
        blockhash(block.number - 1),
        block.timestamp,
        msg.sender
    )));
}
```

**Why this fails:**

- **Validator Control:** Block proposers can manipulate timestamps within bounds and choose which transactions to include.
- **Predictable Attacks:** Any user can compute the same "random" value and only execute transactions with favorable outcomes.
- **Blockhash Limitations:** Only accessible for 256 recent blocks; older queries return zero.
- **256-Block Exploit:** If contract logic can be delayed for >256 blocks, blockhash() returns 0x0, creating an exploitable known value.
- **Validator Re-rolling:** Validators can discard unfavorable blocks and try again if the value at stake exceeds block rewards.

### Block.prevrandao (The RANDAO Trap)

After Ethereum's Proof-of-Stake transition, `block.difficulty` became `block.prevrandao`. While better than timestamp, it's still **not secure for smart contracts**.

**What is RANDAO?** It's a mechanism where validators contribute to a shared random number through cryptographic commitments. However, this doesn't solve the manipulation problem.

```solidity
// Still vulnerable - Don't use for valuable applications
function stillBad() public view returns (uint256) {
    return uint256(keccak256(abi.encodePacked(block.prevrandao, msg.sender)));
}
```

**Vulnerabilities:**

- **Validator Bias:** The proposing validator knows prevrandao in advance and can choose to skip their slot if the outcome is unfavorable.
- **Same-Block Predictability:** All transactions in a block see the same prevrandao value.

**Note:** The way to avoid this is using a future randao. For a practical implementation, see this [SE-2 extension](https://speedrunethereum.com/builds/1449d6d5-e014-531c-91f6-abb747281375).

---

## 3. The Gold Standard: Chainlink VRF

**Chainlink Verifiable Random Function (VRF)** is the industry-standard solution for secure on-chain randomness. It provides cryptographically provable randomness that cannot be manipulated by validators, oracles, or users.

### How Chainlink VRF Works

1. **Request:** Your contract requests randomness from the VRF Coordinator
2. **Generation:** Chainlink nodes generate random numbers with cryptographic proofs
3. **Verification:** The coordinator verifies proofs on-chain before delivery
4. **Callback:** Your contract receives verifiably random numbers

### Basic Implementation

For a complete Chainlink VRF implementation with detailed setup instructions, deployment scripts, and advanced patterns, see our dedicated guide: **[Chainlink VRF Implementation: Provably Fair Randomness for Smart Contracts](/guides/chainlink-vrf-solidity-games)**

**Key VRF Benefits:**

- **Provably Fair:** Cryptographic proofs ensure randomness integrity
- **Manipulation-Resistant:** Neither validators nor oracles can bias results
- **Production-Ready:** Used by major DeFi protocols and gaming platforms

---

## 4. Decentralized Alternative: Commit-Reveal Schemes

For applications requiring maximum decentralization, **commit-reveal schemes** provide secure randomness without external oracles.

### How Commit-Reveal Works

1. **Commit Phase:** Users submit hashed commitments containing secret values
2. **Waiting Period:** Time delay prevents manipulation
3. **Reveal Phase:** Users reveal their secrets; contract verifies against commitments
4. **Randomness Generation:** Combine revealed values to generate unpredictable outcomes

### Implementation Example

```solidity
contract CommitRevealLottery {
    struct Commitment {
        bytes32 commit;
        uint256 blockNumber;
        bool revealed;
    }

    mapping(address => Commitment) public commitments;
    mapping(uint256 => bool) public usedNonces;

    uint256 public constant COMMIT_PERIOD = 100; // blocks
    uint256 public constant REVEAL_PERIOD = 50;  // blocks
    uint256 public constant MIN_PARTICIPANTS = 3;

    uint256 public lotteryStart;
    uint256 public revealDeadline;
    uint256 public randomSeed;
    uint256 public participantCount;

    address[] public participants;
    uint256 public revealedCount;

    event CommitSubmitted(address indexed participant);
    event SecretRevealed(address indexed participant);
    event LotteryFinalized(uint256 randomSeed);

    constructor() {
        lotteryStart = block.number;
        revealDeadline = lotteryStart + COMMIT_PERIOD + REVEAL_PERIOD;
    }

    function commitSecret(bytes32 _hashedSecret) external {
        require(block.number >= lotteryStart, "Lottery not started");
        require(block.number < lotteryStart + COMMIT_PERIOD, "Commit period ended");
        require(commitments[msg.sender].commit == bytes32(0), "Already committed");

        commitments[msg.sender] = Commitment({
            commit: _hashedSecret,
            blockNumber: block.number,
            revealed: false
        });

        participants.push(msg.sender);
        participantCount++;

        emit CommitSubmitted(msg.sender);
    }

    function revealSecret(uint256 _secret, uint256 _nonce) external {
        require(block.number >= lotteryStart + COMMIT_PERIOD, "Reveal period not started");
        require(block.number <= revealDeadline, "Reveal period ended");
        require(!usedNonces[_nonce], "Nonce already used");

        Commitment storage commitment = commitments[msg.sender];
        require(commitment.commit != bytes32(0), "No commitment found");
        require(!commitment.revealed, "Already revealed");

        bytes32 hash = keccak256(abi.encodePacked(_secret, _nonce, msg.sender));
        require(hash == commitment.commit, "Invalid reveal");

        commitment.revealed = true;
        usedNonces[_nonce] = true;
        revealedCount++;

        // More secure entropy combination
        randomSeed = uint256(keccak256(abi.encodePacked(
            randomSeed,
            _secret,
            msg.sender,
            block.timestamp,
            commitment.blockNumber
        )));

        emit SecretRevealed(msg.sender);
    }

    function getRandomNumber() external view returns (uint256) {
        require(block.number > revealDeadline, "Reveal period not finished");
        require(revealedCount >= MIN_PARTICIPANTS, "Insufficient reveals");
        return randomSeed;
    }

    function isLotteryFinalized() external view returns (bool) {
        return block.number > revealDeadline && revealedCount >= MIN_PARTICIPANTS;
    }
}
```

### Protecting Against Replay Attacks

Commit-reveal schemes must protect against **replay attacks**, where attackers intercept and reuse valid transactions. The defense is using **nonces** (numbers used once) - unique, incrementing values that make each signature valid only once.

### Commit-Reveal Trade-offs

**Pros:**

- Fully decentralized
- No external dependencies
- Resistant to manipulation

**Cons:**

- Requires multiple transactions
- Vulnerable if users don't reveal
- More complex user experience

---

## 5. Choosing the Right Solution

<table>
  <thead>
    <tr>
      <th>Method</th>
      <th>Security</th>
      <th>Decentralization</th>
      <th>UX</th>
      <th>Best For</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Chainlink VRF</strong></td>
      <td>Very High</td>
      <td>Medium</td>
      <td>Good</td>
      <td>Gaming, NFTs, lotteries</td>
    </tr>
    <tr>
      <td><strong>Commit-Reveal</strong></td>
      <td>High</td>
      <td>Very High</td>
      <td>Poor</td>
      <td>Voting, auctions</td>
    </tr>
    <tr>
      <td><strong>Block Variables</strong></td>
      <td>Very Low</td>
      <td>High</td>
      <td>Good</td>
      <td>Testing only</td>
    </tr>
  </tbody>
</table>

### Decision Framework

**Use Chainlink VRF when:**

- Building production applications with real value
- User experience is important
- You need immediate randomness

**Use Commit-Reveal when:**

- Maximum decentralization is required
- Multi-transaction UX is acceptable
- Building voting or auction systems

**Never use block variables when:**

- Real value is at stake
- Fairness matters to users
- Security is a concern

---

## 6. Best Practices for Secure Randomness

### Security Checklist

- Never use block variables for valuable applications
- Implement proper access controls on randomness functions
- Use sufficient confirmation blocks for VRF requests
- Include nonces in commit-reveal to prevent replay attacks
- Test randomness implementations thoroughly
- Consider economic incentives for manipulation

### Common Mistakes to Avoid

- **Insufficient Randomness Sources:** Don't rely on predictable inputs
- **Race Conditions:** Ensure proper ordering of operations
- **Reentrancy Vulnerabilities:** Use appropriate guards
- **Inadequate Testing:** Test with adversarial scenarios

---

## 7. Real-World Applications

### Gaming and NFTs

- **Dice Games:** Provably fair outcomes using Chainlink VRF
- **NFT Reveals:** Random trait assignment for fair launches
- **Loot Boxes:** Transparent randomness for in-game rewards

### DeFi Applications

- **Liquidation Ordering:** Fair liquidation sequences
- **Validator Selection:** Random validator assignment
- **Sampling:** Random selection for audits or governance

---

## 8. Testing Your Randomness

```solidity
// Example test for randomness distribution
contract RandomnessTest {
    mapping(uint256 => uint256) public outcomes;
    uint256 public totalRolls;

    function testDistribution(uint256 randomValue) external {
        uint256 result = randomValue % 6 + 1; // Dice roll 1-6
        outcomes[result]++;
        totalRolls++;
    }

    function getDistribution() external view returns (uint256[6] memory) {
        uint256[6] memory distribution;
        for (uint256 i = 0; i < 6; i++) {
            distribution[i] = outcomes[i + 1];
        }
        return distribution;
    }
}
```

---

## 9. Conclusion: Building Trustworthy Applications

Secure randomness is fundamental to fair and trustworthy blockchain applications. While the deterministic nature of blockchains makes this challenging, proven solutions like Chainlink VRF and commit-reveal schemes enable truly random outcomes.

**Key Takeaways:**

- Block variables are never secure for valuable applications
- Chainlink VRF provides production-ready, provably fair randomness
- Commit-reveal offers decentralized randomness with UX trade-offs
- Always consider economic incentives for manipulation
- Test thoroughly with adversarial scenarios

**Ready to build provably fair applications?** [Try the Dice Game Challenge!](/challenge/dice-game)

---

**Want to learn more about blockchain security?** [Explore Flash Loan Exploits](/guides/flash-loan-exploits)
