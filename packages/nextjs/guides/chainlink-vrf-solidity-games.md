---
title: "Chainlink VRF Implementation: Provably Fair Randomness for Smart Contracts"
description: "Learn to implement Chainlink VRF v2 in Solidity smart contracts for provably fair randomness. Complete guide with code examples, security patterns, and best practices for Web3 developers."
image: "/assets/guides/chainlink-vrf-in-smart-contracts.jpg"
---

## TL;DR: Chainlink VRF for Solidity Smart Contracts

- **Chainlink VRF** provides cryptographically secure, verifiable randomness for blockchain applications
- **Never use** `block.timestamp`, `blockhash`, or other on-chain variables for randomnessthey're predictable and manipulable
- **Two-step process:** Request randomness � Oracle fulfills with cryptographic proof � Your contract receives verified random numbers
- **Subscription model** is best for games with frequent randomness requests (lower gas costs)
- **Security critical:** Use commit-reveal patterns, avoid input manipulation, and handle callback failures gracefully

---

## 1. The Blockchain Randomness Problem

Blockchain networks are deterministic by design every node must execute the same transactions and reach identical results. This creates a fundamental challenge: **how do you generate truly random numbers on a predictable system?**

### Why On-Chain "Randomness" Fails

Many developers initially try using on-chain variables like `block.timestamp` or `blockhash`, but these approaches have critical vulnerabilities:

```solidity
// VULNERABLE: Predictable and manipulable
function rollDice() external {
    uint256 roll = block.timestamp % 6 + 1;
    // Miners can manipulate timestamp to influence outcome
}
```

**The Problems:**

- **Miner manipulation:** Validators can influence block properties to favorable outcomes
- **Public visibility:** All transaction data is visible in the mempool before execution
- **Predictability:** "Random" values can be calculated in advance

### The Solution: Verifiable Random Functions (VRF)

Chainlink VRF solves this by combining:

1. **Off-chain randomness generation** (unpredictable to on-chain actors)
2. **Cryptographic proofs** (verifiable on-chain)
3. **Decentralized oracle network** (no single point of failure)

#### Cryptographic Foundation: How VRF Actually Works

A Verifiable Random Function is a public-key version of a keyed cryptographic hash function that provides:

**Key Components:**

- **Key Generation:** Oracle generates a public key (PK) and secret key (SK) pair
- **Proving:** Oracle uses SK + input seed → generates random output + cryptographic proof
- **Verifying:** Anyone with PK can verify the proof without knowing SK

**The Process:**

1. **Input Seed:** Derived from blockhash of your request transaction (unpredictable when making request)
2. **Oracle Computation:** Uses secret key + seed → produces random number + proof
3. **On-Chain Verification:** Coordinator contract verifies proof using public key
4. **Delivery:** Only verified random numbers reach your contract

This mathematical guarantee means the oracle **cannot** manipulate results - any tampering would fail cryptographic verification.

---

## 2. How Chainlink VRF Works

VRF uses a **request-and-fulfill** pattern that ensures both unpredictability and verifiability.

### The VRF Process

```
1. REQUEST  � Your contract requests randomness + pays fee
2. GENERATE � Oracle creates random number + cryptographic proof
3. VERIFY   � On-chain verification of the proof
4. FULFILL  � Verified random number delivered to your contract
```

### Key VRF Components

- **VRF Coordinator:** On-chain contract that manages requests and verifies proofs
- **Subscription:** Pre-funded account that pays for randomness requests
- **Consumer Contract:** Your game contract that requests and receives randomness
- **Oracle Nodes:** Off-chain services that generate randomness and proofs

### Subscription vs Direct Funding

<table>
  <thead>
    <tr>
      <th>Feature</th>
      <th>Subscription Model</th>
      <th>Direct Funding</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Best For</strong></td>
      <td>Games with frequent requests</td>
      <td>Infrequent, one-off requests</td>
    </tr>
    <tr>
      <td><strong>Gas Efficiency</strong></td>
      <td>Lower per-request overhead</td>
      <td>Higher overhead per request</td>
    </tr>
    <tr>
      <td><strong>Management</strong></td>
      <td>Centralized funding for multiple contracts</td>
      <td>Individual contract funding</td>
    </tr>
    <tr>
      <td><strong>Setup Complexity</strong></td>
      <td>One-time subscription setup required</td>
      <td>Simpler to start</td>
    </tr>
  </tbody>
</table>

For games, the **subscription model** is typically more efficient.

### Economic Security Model

The subscription model provides critical security benefits beyond convenience:

**DoS Attack Prevention:**

- Pre-funded subscriptions prevent attackers from spamming requests without payment
- Request limits and gas pricing discourage abuse
- Subscription owners control which contracts can use their funds

**MEV (Maximum Extractable Value) Considerations:**

- VRF requests are public in mempool, but outcomes are cryptographically secured
- Miners cannot manipulate VRF results (unlike `blockhash` approaches)
- Front-running protection requires application-level commit-reveal patterns

**Cost Analysis:**

- **High-frequency games:** Subscription model reduces gas overhead per request
- **Low-frequency apps:** Direct funding may be more cost-effective
- **Enterprise apps:** Subscription enables centralized billing and cost control

### VRF v2 vs v2.5: What's New?

Chainlink VRF v2.5 introduces several improvements over v2:

<table>
  <thead>
    <tr>
      <th>Feature</th>
      <th>VRF v2</th>
      <th>VRF v2.5</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Native Token Support</strong></td>
      <td>LINK only</td>
      <td>LINK + native tokens (ETH, MATIC, etc.)</td>
    </tr>
    <tr>
      <td><strong>Coordinator Address</strong></td>
      <td>Network-specific</td>
      <td>Unified across networks</td>
    </tr>
    <tr>
      <td><strong>Gas Efficiency</strong></td>
      <td>Standard</td>
      <td>Optimized fulfillment process</td>
    </tr>
    <tr>
      <td><strong>Request Configuration</strong></td>
      <td>Constructor-based</td>
      <td>Per-request configuration options</td>
    </tr>
  </tbody>
</table>

**Migration Note:** This guide uses v2 for broader compatibility. To upgrade to v2.5, change your imports and coordinator addresses. The core concepts remain the same.

---

## 3. Setting Up Your Environment

### Prerequisites

```bash
# Initialize your project
mkdir vrf-dice-game && cd vrf-dice-game
npm init -y
npm install --save-dev hardhat
npx hardhat

# Install Chainlink contracts
npm install @chainlink/contracts

# Install dotenv for environment variables
npm install dotenv
```

### Environment Configuration

Create a `.env` file (never commit this!):

```env
SEPOLIA_RPC_URL="YOUR_ALCHEMY_OR_INFURA_URL"
PRIVATE_KEY="YOUR_WALLET_PRIVATE_KEY"
ETHERSCAN_API_KEY="YOUR_ETHERSCAN_API_KEY"
VRF_SUBSCRIPTION_ID="YOUR_SUBSCRIPTION_ID"
```

### Hardhat Configuration

Update `hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
```

---

## 4. Creating Your VRF Subscription

### Step 1: Visit the Subscription Manager

Go to [vrf.chain.link](https://vrf.chain.link) and connect your wallet (ensure you're on Sepolia testnet).

### Step 2: Create and Fund Subscription

1. Click "Create Subscription"
2. Confirm the transaction
3. Note your **Subscription ID** (you'll need this for deployment)
4. Add funds: Minimum 5-10 testnet LINK recommended
5. Get testnet LINK from [Chainlink faucets](https://faucets.chain.link)

### Step 3: Network Parameters

For Sepolia testnet, you'll need:

```solidity
// Sepolia VRF Coordinator: 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625
// Key Hash (500 gwei): 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c
```

### Network-Specific Security Considerations

Different networks have varying security characteristics that affect VRF configuration:

<table>
  <thead>
    <tr>
      <th>Network</th>
      <th>Recommended Confirmations</th>
      <th>Block Time</th>
      <th>Reorg Risk</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Ethereum Mainnet</strong></td>
      <td>3-6 confirmations</td>
      <td>~12 seconds</td>
      <td>Low</td>
    </tr>
    <tr>
      <td><strong>Polygon</strong></td>
      <td>10-20 confirmations</td>
      <td>~2 seconds</td>
      <td>Medium</td>
    </tr>
    <tr>
      <td><strong>BSC</strong></td>
      <td>15-20 confirmations</td>
      <td>~3 seconds</td>
      <td>Higher</td>
    </tr>
    <tr>
      <td><strong>Arbitrum</strong></td>
      <td>1-3 confirmations</td>
      <td>~1 second</td>
      <td>Low</td>
    </tr>
  </tbody>
</table>

**Configuration Impact:**

- **Higher confirmations** = more security but longer wait times
- **Faster networks** need more confirmations due to higher reorg probability
- **High-value applications** should use conservative confirmation counts

---

## 5. Building Your Smart Contract

### Complete VRF Implementation

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2Plus.sol";
import "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

/**
 * @title Secure VRF Implementation using Chainlink VRF v2Plus
 * @notice Demonstrates provably fair randomness in smart contracts
 */
contract VRFExample is VRFConsumerBaseV2Plus {
    // Events for transparency
    event RandomnessRequested(uint256 indexed requestId, address indexed requester);
    event RandomnessFulfilled(uint256 indexed requestId, address indexed requester, uint256 result);
    event RequestFailed(uint256 indexed requestId, address indexed requester);

    // VRF Configuration
    IVRFCoordinatorV2Plus private immutable i_vrfCoordinator;
    uint256 private immutable i_subscriptionId;
    bytes32 private immutable i_keyHash;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    // Contract State
    mapping(uint256 => address) public s_requesters;
    mapping(address => uint256) public s_results;
    mapping(address => uint256) public s_requestCount;
    mapping(uint256 => bool) public s_failedRequests;

    constructor(
        address vrfCoordinatorV2Plus,
        uint256 subscriptionId,
        bytes32 keyHash,
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2Plus(vrfCoordinatorV2Plus) {
        i_vrfCoordinator = IVRFCoordinatorV2Plus(vrfCoordinatorV2Plus);
        i_subscriptionId = subscriptionId;
        i_keyHash = keyHash;
        i_callbackGasLimit = callbackGasLimit;
    }

    /**
     * @notice Request random numbers from Chainlink VRF
     * @return requestId The VRF request ID
     */
    function requestRandomness() external returns (uint256 requestId) {
        // Request random words from Chainlink VRF v2Plus
        requestId = i_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: i_keyHash,
                subId: i_subscriptionId,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit: i_callbackGasLimit,
                numWords: NUM_WORDS,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                )
            })
        );

        // Store the requester with validation
        require(s_requesters[requestId] == address(0), "Request ID collision");
        s_requesters[requestId] = msg.sender;
        s_requestCount[msg.sender]++;

        emit RandomnessRequested(requestId, msg.sender);
        return requestId;
    }

    /**
     * @notice Callback function used by VRF Coordinator
     * @param requestId The ID of the VRF request
     * @param randomWords The array of random results from VRF
     */
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] calldata randomWords
    ) internal override {
        address requester = s_requesters[requestId];

        // Graceful failure handling
        if (requester == address(0)) {
            s_failedRequests[requestId] = true;
            emit RequestFailed(requestId, address(0));
            return;
        }

        // Process the random number (example: convert to 1-6 range)
        uint256 result = (randomWords[0] % 6) + 1;

        // Store result for the requester
        s_results[requester] = result;

        // Clean up mapping to save gas
        delete s_requesters[requestId];

        emit RandomnessFulfilled(requestId, requester, result);
    }

    // View functions for checking contract state
    function getLastResult(address requester) external view returns (uint256) {
        return s_results[requester];
    }

    function getRequestCount(address requester) external view returns (uint256) {
        return s_requestCount[requester];
    }

    function isRequestFailed(uint256 requestId) external view returns (bool) {
        return s_failedRequests[requestId];
    }

    // Get subscription balance
    function getSubscriptionBalance() external view returns (uint256 balance) {
        // Note: This would need to be implemented based on the specific coordinator
        // For demonstration purposes, returning 0
        return 0;
    }
}
```

### Key Code Components Explained

#### Constructor Parameters

- `vrfCoordinatorV2`: Network-specific VRF Coordinator address
- `subscriptionId`: Your funded subscription ID
- `keyHash`: Gas lane that determines max gas price for fulfillment
- `callbackGasLimit`: Gas limit for the `fulfillRandomWords` callback

#### Request Flow

1. `rollDice()` calls the VRF Coordinator with your configuration
2. Returns a unique `requestId` for tracking
3. Maps `requestId` to the requesting player
4. Emits event for off-chain monitoring

#### Fulfillment Flow

1. `fulfillRandomWords()` is called by the VRF Coordinator (not users!)
2. Retrieves the original requester using `requestId`
3. Converts raw random number to dice roll (1-6)
4. Stores result and cleans up state

---

## 6. Deployment and Configuration

### Deployment Script

Create `scripts/deploy.js`:

```javascript
const { ethers } = require("hardhat");

async function main() {
  // Sepolia network parameters
  const VRF_COORDINATOR = "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625";
  const KEY_HASH = "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c";
  const SUBSCRIPTION_ID = process.env.VRF_SUBSCRIPTION_ID;
  const CALLBACK_GAS_LIMIT = 500000;

  const VRFExample = await ethers.getContractFactory("VRFExample");

  console.log("Deploying VRFExample...");
  const vrfExample = await VRFExample.deploy(VRF_COORDINATOR, SUBSCRIPTION_ID, KEY_HASH, CALLBACK_GAS_LIMIT);

  await vrfExample.waitForDeployment();
  const address = await vrfExample.getAddress();

  console.log(`VRFExample deployed to: ${address}`);
  console.log(`Remember to add this address as a consumer to subscription ${SUBSCRIPTION_ID}`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
```

### Deploy to Sepolia

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Add Consumer to Subscription

**Critical Step:** After deployment, you must add your contract as an authorized consumer:

1. Go to [vrf.chain.link](https://vrf.chain.link)
2. Select your subscription
3. Click "Add consumer"
4. Enter your deployed contract address
5. Confirm the transaction

Without this step, all VRF requests will fail!

---

## 7. Testing Your Implementation

### Interaction Script

Create `scripts/rollDice.js`:

```javascript
const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "YOUR_DEPLOYED_ADDRESS";
  const VRFExample = await ethers.getContractFactory("VRFExample");
  const vrfExample = VRFExample.attach(contractAddress);

  console.log("Requesting randomness...");
  const tx = await vrfExample.requestRandomness();
  const receipt = await tx.wait();

  // Extract request ID from events
  const event = receipt.events?.find(e => e.event === "RandomnessRequested");
  const requestId = event?.args?.requestId;

  console.log(`Request submitted! Request ID: ${requestId}`);
  console.log("Waiting for VRF fulfillment (this may take 1-2 minutes)...");

  // Poll for result
  const [signer] = await ethers.getSigners();
  let result = 0;

  while (result === 0) {
    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
    result = await vrfExample.getLastResult(signer.address);
    if (result > 0) {
      console.log(`<� Dice result: ${result}`);
      break;
    }
    console.log("Still waiting for result...");
  }
}

main().catch(console.error);
```

---

## 8. Advanced Security Patterns

### 8.1 Request Batching for High-Throughput Applications

For applications with many simultaneous users, batching requests improves efficiency:

```solidity
contract BatchVRFExample is VRFConsumerBaseV2Plus {
    struct BatchRequest {
        address[] users;
        uint256 timestamp;
        bool fulfilled;
    }

    IVRFCoordinatorV2Plus private immutable i_vrfCoordinator;
    uint256 private immutable i_subscriptionId;
    bytes32 private immutable i_keyHash;
    uint32 private constant CALLBACK_GAS_LIMIT = 500000;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;

    uint256 public constant MAX_BATCH_SIZE = 20;
    uint256 public constant BATCH_TIMEOUT = 5 minutes;

    mapping(uint256 => BatchRequest) public batchRequests;
    mapping(address => uint256) public userBatches;
    mapping(address => uint256) public s_results;
    uint256 public currentBatchId;

    event BatchCreated(uint256 indexed batchId, uint256 timestamp);
    event UserJoinedBatch(address indexed user, uint256 indexed batchId);
    event BatchFulfilled(uint256 indexed batchId, uint256 userCount);

    constructor(
        address vrfCoordinator,
        uint256 subscriptionId,
        bytes32 keyHash
    ) VRFConsumerBaseV2Plus(vrfCoordinator) {
        i_vrfCoordinator = IVRFCoordinatorV2Plus(vrfCoordinator);
        i_subscriptionId = subscriptionId;
        i_keyHash = keyHash;
    }

    function joinBatch() external {
        require(userBatches[msg.sender] == 0, "Already in batch");

        if (currentBatchId == 0 ||
            batchRequests[currentBatchId].users.length >= MAX_BATCH_SIZE ||
            batchRequests[currentBatchId].fulfilled) {
            currentBatchId = _requestNewBatch();
        }

        batchRequests[currentBatchId].users.push(msg.sender);
        userBatches[msg.sender] = currentBatchId;

        emit UserJoinedBatch(msg.sender, currentBatchId);
    }

    function _requestNewBatch() internal returns (uint256 requestId) {
        requestId = i_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: i_keyHash,
                subId: i_subscriptionId,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit: CALLBACK_GAS_LIMIT,
                numWords: 1,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                )
            })
        );

        batchRequests[requestId] = BatchRequest({
            users: new address[](0),
            timestamp: block.timestamp,
            fulfilled: false
        });

        emit BatchCreated(requestId, block.timestamp);
        return requestId;
    }

    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords)
        internal override {
        BatchRequest storage batch = batchRequests[requestId];
        require(!batch.fulfilled, "Already fulfilled");

        // Distribute random results to all users in batch
        uint256 seed = randomWords[0];
        uint256 userCount = batch.users.length;

        for (uint256 i = 0; i < userCount; i++) {
            uint256 userSeed = uint256(keccak256(abi.encode(seed, i, batch.users[i])));
            uint256 result = (userSeed % 6) + 1;
            s_results[batch.users[i]] = result;

            // Clear user's batch assignment
            delete userBatches[batch.users[i]];
        }

        batch.fulfilled = true;
        emit BatchFulfilled(requestId, userCount);
    }

    function getUserResult(address user) external view returns (uint256) {
        return s_results[user];
    }

    function getBatchInfo(uint256 batchId) external view returns (
        uint256 userCount,
        uint256 timestamp,
        bool fulfilled
    ) {
        BatchRequest storage batch = batchRequests[batchId];
        return (batch.users.length, batch.timestamp, batch.fulfilled);
    }
}
```

### 8.2 Emergency Pause Mechanisms

Production applications need circuit breakers for critical situations:

```solidity
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2Plus.sol";
import "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

contract SecureVRFExample is VRFConsumerBaseV2Plus, Pausable, AccessControl {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    // VRF Configuration
    IVRFCoordinatorV2Plus private immutable i_vrfCoordinator;
    uint256 private immutable i_subscriptionId;
    bytes32 private immutable i_keyHash;
    uint32 private constant CALLBACK_GAS_LIMIT = 500000;

    // Events
    event EmergencyPause(address indexed pauser, uint256 timestamp);
    event ApplicationPaused(address indexed pauser, string reason, uint256 timestamp);
    event ApplicationUnpaused(address indexed unpauser, uint256 timestamp);

    constructor(
        address vrfCoordinator,
        uint256 subscriptionId,
        bytes32 keyHash,
        address admin
    ) VRFConsumerBaseV2Plus(vrfCoordinator) {
        i_vrfCoordinator = IVRFCoordinatorV2Plus(vrfCoordinator);
        i_subscriptionId = subscriptionId;
        i_keyHash = keyHash;

        // Setup roles
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(EMERGENCY_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
    }

    modifier emergencyStop() {
        require(!paused(), "Game paused");
        _;
    }

    function requestRandomness() external emergencyStop returns (uint256 requestId) {
        requestId = i_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: i_keyHash,
                subId: i_subscriptionId,
                requestConfirmations: 3,
                callbackGasLimit: CALLBACK_GAS_LIMIT,
                numWords: 1,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                )
            })
        );
        return requestId;
    }

    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords)
        internal override {
        // Process randomness even when paused (critical for VRF completion)
        // Your game logic here
    }

    // Immediate pause for critical security issues
    function emergencyPause() external onlyRole(EMERGENCY_ROLE) {
        _pause();
        emit EmergencyPause(msg.sender, block.timestamp);
    }

    // Structured pause with reason
    function pauseApplication(string calldata reason) external onlyRole(PAUSER_ROLE) {
        _pause();
        emit ApplicationPaused(msg.sender, reason, block.timestamp);
    }

    function unpauseApplication() external onlyRole(PAUSER_ROLE) {
        _unpause();
        emit ApplicationUnpaused(msg.sender, block.timestamp);
    }
}
```

### 8.3 Preventing Input Manipulation

**The Threat:** Users could see the VRF fulfillment transaction in the mempool and front-run it to change their input (e.g., increase bet size after seeing a winning number).

**The Defense:** Use commit-reveal patterns:

```solidity
contract SecureBettingGame is VRFConsumerBaseV2Plus {
    struct Commitment {
        bytes32 hashedBet;
        uint256 vrfRequestId;
        uint256 commitBlock;
        bool fulfilled;
        bool revealed;
    }

    IVRFCoordinatorV2Plus private immutable i_vrfCoordinator;
    uint256 private immutable i_subscriptionId;
    bytes32 private immutable i_keyHash;
    uint32 private constant CALLBACK_GAS_LIMIT = 500000;

    mapping(address => Commitment) public commitments;
    mapping(uint256 => address) public requestToPlayer;
    mapping(uint256 => bool) public usedNonces;

    uint256 public constant MIN_COMMIT_BLOCKS = 1;
    uint256 public constant MAX_REVEAL_BLOCKS = 100;

    event BetCommitted(address indexed player, bytes32 hashedBet);
    event BetRevealed(address indexed player, uint256 betAmount);
    event BetSettled(address indexed player, bool won, uint256 payout);

    constructor(
        address vrfCoordinator,
        uint256 subscriptionId,
        bytes32 keyHash
    ) VRFConsumerBaseV2Plus(vrfCoordinator) {
        i_vrfCoordinator = IVRFCoordinatorV2Plus(vrfCoordinator);
        i_subscriptionId = subscriptionId;
        i_keyHash = keyHash;
    }

    // Step 1: Commit to bet before requesting randomness
    function commitBet(bytes32 hashedBet) external {
        require(commitments[msg.sender].vrfRequestId == 0, "Already committed");

        commitments[msg.sender] = Commitment({
            hashedBet: hashedBet,
            vrfRequestId: 0,
            commitBlock: block.number,
            fulfilled: false,
            revealed: false
        });

        // Request randomness AFTER commitment is locked
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: i_keyHash,
                subId: i_subscriptionId,
                requestConfirmations: 3,
                callbackGasLimit: CALLBACK_GAS_LIMIT,
                numWords: 1,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                )
            })
        );

        commitments[msg.sender].vrfRequestId = requestId;
        requestToPlayer[requestId] = msg.sender;

        emit BetCommitted(msg.sender, hashedBet);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords)
        internal override {
        address player = requestToPlayer[requestId];
        if (player != address(0)) {
            commitments[player].fulfilled = true;
            // Store the random result for later use in settlement
        }
    }

    // Step 2: Reveal bet after randomness is fulfilled
    function revealAndSettle(uint256 betAmount, uint256 nonce) external {
        Commitment storage commitment = commitments[msg.sender];
        require(commitment.vrfRequestId != 0, "No commitment");
        require(commitment.fulfilled && !commitment.revealed, "Invalid state");
        require(block.number >= commitment.commitBlock + MIN_COMMIT_BLOCKS, "Too early to reveal");
        require(block.number <= commitment.commitBlock + MAX_REVEAL_BLOCKS, "Reveal period expired");
        require(!usedNonces[nonce], "Nonce already used");

        // Verify the revealed bet matches the commitment
        bytes32 computedHash = keccak256(abi.encodePacked(betAmount, nonce, msg.sender));
        require(computedHash == commitment.hashedBet, "Invalid reveal");

        commitment.revealed = true;
        usedNonces[nonce] = true;

        emit BetRevealed(msg.sender, betAmount);

        // Process settlement with revealed bet amount
        _settleBet(msg.sender, betAmount, commitment.vrfRequestId);
    }

    function _settleBet(address player, uint256 betAmount, uint256 requestId) internal {
        // Settlement logic using the VRF result and revealed bet amount
        // Implementation depends on specific game rules
        emit BetSettled(player, true, betAmount * 2); // Example outcome

        // Cleanup
        delete commitments[player];
        delete requestToPlayer[requestId];
    }
}
```

### 8.4 Handling Callback Failures

**The Threat:** If `fulfillRandomWords` reverts, the randomness is lost forever and won't be retried.

**The Defense:** Keep callback logic minimal and robust:

```solidity
contract RobustDiceGame is VRFConsumerBaseV2Plus {
    mapping(uint256 => address) public s_rollers;
    mapping(uint256 => uint256) public s_rawResults;
    mapping(address => uint256) public s_pendingResults;
    mapping(address => uint256) public s_results;

    event RandomnessReceived(uint256 indexed requestId, address indexed player);
    event DiceRolled(address indexed player, uint256 result);

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] calldata randomWords
    ) internal override {
        address player = s_rollers[requestId];
        if (player == address(0)) return; // Graceful failure

        // Store raw result - do complex logic in separate function
        s_rawResults[requestId] = randomWords[0];
        s_pendingResults[player] = requestId;

        emit RandomnessReceived(requestId, player);
        // Let user call separate function to process their result
    }

    function processResult() external {
        uint256 requestId = s_pendingResults[msg.sender];
        require(requestId != 0, "No pending result");

        uint256 randomness = s_rawResults[requestId];
        require(randomness != 0, "Result not ready");

        // Now do complex game logic safely
        uint256 diceRoll = (randomness % 6) + 1;
        s_results[msg.sender] = diceRoll;

        // Cleanup
        delete s_pendingResults[msg.sender];
        delete s_rawResults[requestId];
        delete s_rollers[requestId];

        emit DiceRolled(msg.sender, diceRoll);
    }
}
```

### 8.5 Chain Reorganization Protection

**The Configuration:** The `REQUEST_CONFIRMATIONS` parameter protects against chain reorgs:

```solidity
// Sepolia: 3 confirmations (recommended)
// Mainnet: 3-6 confirmations depending on value at risk
// BSC: 10+ confirmations (faster blocks, higher reorg risk)
uint16 private constant REQUEST_CONFIRMATIONS = 3;
```

Higher confirmations = more security but longer wait times.

---

## 9. Gas Optimization Tips

### Efficient State Management

```solidity
// Expensive: Multiple storage writes
function inefficientRoll() external {
    s_playerCount++;
    s_lastRollTime = block.timestamp;
    s_playerStats[msg.sender].rolls++;
    // Request VRF...
}

//  Optimized: Batch updates, use events for non-critical data
function optimizedRoll() external {
    // Only essential state changes
    uint256 requestId = requestVRF();
    s_rollers[requestId] = msg.sender;

    // Use events for analytics (much cheaper)
    emit RollInitiated(msg.sender, block.timestamp);
}
```

### Subscription Management

```solidity
// Monitor subscription balance
function getSubscriptionBalance() external view returns (uint256) {
    (uint96 balance, , , ) = i_vrfCoordinator.getSubscription(i_subscriptionId);
    return balance;
}

// Auto-refill logic (call from backend)
function checkAndRefill() external {
    (uint96 balance, , , ) = i_vrfCoordinator.getSubscription(i_subscriptionId);
    if (balance < MINIMUM_BALANCE) {
        // Trigger refill notification or auto-fund
        emit LowBalance(balance);
    }
}
```

### Production Health Monitoring

Implement comprehensive monitoring for production VRF applications:

```solidity
contract MonitoredDiceGame is VRFConsumerBaseV2Plus {
    // Health metrics
    uint256 public totalRequests;
    uint256 public totalFulfillments;
    uint256 public failedFulfillments;
    uint256 public averageFulfillmentTime;

    // Alerting thresholds
    uint256 public constant MAX_FULFILLMENT_TIME = 5 minutes;
    uint256 public constant MIN_SUCCESS_RATE = 95; // 95%

    mapping(uint256 => uint256) public requestTimestamps;

    function rollDice() external returns (uint256 requestId) {
        requestId = i_vrfCoordinator.requestRandomWords(/*...*/);
        requestTimestamps[requestId] = block.timestamp;
        totalRequests++;

        emit RequestSubmitted(requestId, msg.sender, block.timestamp);
        return requestId;
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
        internal override {
        uint256 fulfillmentTime = block.timestamp - requestTimestamps[requestId];

        // Update metrics
        totalFulfillments++;
        averageFulfillmentTime = (averageFulfillmentTime + fulfillmentTime) / 2;

        // Alert on slow fulfillment
        if (fulfillmentTime > MAX_FULFILLMENT_TIME) {
            emit SlowFulfillment(requestId, fulfillmentTime);
        }

        // Check success rate
        uint256 successRate = (totalFulfillments * 100) / totalRequests;
        if (successRate < MIN_SUCCESS_RATE) {
            emit LowSuccessRate(successRate, totalRequests, totalFulfillments);
        }

        // Normal game logic...
        processRandomResult(requestId, randomWords[0]);

        emit FulfillmentCompleted(requestId, fulfillmentTime, block.timestamp);
    }

    // Manual failure tracking for timeout scenarios
    function markRequestFailed(uint256 requestId) external onlyOwner {
        require(requestTimestamps[requestId] > 0, "Invalid request");
        require(block.timestamp > requestTimestamps[requestId] + MAX_FULFILLMENT_TIME, "Too early");

        failedFulfillments++;
        emit RequestFailed(requestId, block.timestamp);
    }

    // Health check endpoint
    function getHealthMetrics() external view returns (
        uint256 _totalRequests,
        uint256 _successRate,
        uint256 _avgFulfillmentTime,
        uint256 _subscriptionBalance
    ) {
        _totalRequests = totalRequests;
        _successRate = totalRequests > 0 ? (totalFulfillments * 100) / totalRequests : 100;
        _avgFulfillmentTime = averageFulfillmentTime;

        (uint96 balance, , , ) = i_vrfCoordinator.getSubscription(i_subscriptionId);
        _subscriptionBalance = balance;
    }
}
```

---

## 10. Common Troubleshooting

### Request Fails Immediately

**Symptoms:** `rollDice()` transaction reverts
**Causes & Solutions:**

- Subscription not funded � Add LINK to subscription
- Contract not added as consumer � Add contract address to subscription
- Invalid key hash � Use correct network-specific key hash
- Subscription ID wrong � Double-check your subscription ID

### Request Never Fulfilled

**Symptoms:** Request succeeds but `fulfillRandomWords` never called
**Causes & Solutions:**

- Callback gas limit too low � Increase `callbackGasLimit` (try 500,000)
- Contract callback function reverts � Simplify `fulfillRandomWords` logic
- Network congestion � Wait longer or increase gas price

### Wrong Network Configuration

```solidity
// L Wrong network parameters will always fail
constructor() VRFConsumerBaseV2(MAINNET_COORDINATOR) {
    // Using mainnet coordinator on testnet!
}

//  Use correct network-specific addresses
constructor() VRFConsumerBaseV2(SEPOLIA_COORDINATOR) {
    // Matches your deployment network
}
```

### Gas Estimation Issues

```solidity
// Set appropriate callback gas limit
uint32 private constant CALLBACK_GAS_LIMIT = 500000; // Conservative estimate

// Monitor actual gas usage
event CallbackGasUsed(uint256 gasUsed);

function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
    internal override {
    uint256 gasStart = gasleft();

    // Your callback logic here...

    emit CallbackGasUsed(gasStart - gasleft());
}
```

### Advanced Callback Gas Optimization

Detailed gas optimization strategies for production VRF applications:

```solidity
contract GasOptimizedDiceGame is VRFConsumerBaseV2 {
    // Packed struct to minimize storage
    struct GameState {
        uint32 roll;           // 4 bytes - enough for dice rolls
        uint32 timestamp;      // 4 bytes - sufficient for timestamps
        uint192 playerId;      // 24 bytes - large player ID space
    }

    // Use mapping instead of array for sparse data
    mapping(address => GameState) public playerStates;
    mapping(uint256 => address) public requestToPlayer;

    // Batch delete for gas refunds
    address[] public playersToCleanup;

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
        internal override {
        address player = requestToPlayer[requestId];

        // Early return for invalid requests (saves gas)
        if (player == address(0)) return;

        // Pack data efficiently
        uint32 roll = uint32((randomWords[0] % 6) + 1);
        uint32 timestamp = uint32(block.timestamp);
        uint192 playerId = uint192(uint256(uint160(player))); // Convert address to ID

        // Single storage write instead of multiple
        playerStates[player] = GameState({
            roll: roll,
            timestamp: timestamp,
            playerId: playerId
        });

        // Clear mapping for gas refund
        delete requestToPlayer[requestId];

        // Minimal event emission
        emit DiceResult(requestId, player, roll);
    }

    // Batch cleanup function (called by backend)
    function cleanupOldGames(address[] calldata players) external onlyOwner {
        for (uint256 i = 0; i < players.length; i++) {
            if (playerStates[players[i]].timestamp < block.timestamp - 1 days) {
                delete playerStates[players[i]]; // Gas refund
            }
        }
    }

    // Gas-efficient batch processing
    function processMultipleResults(
        uint256[] calldata requestIds,
        uint256[] calldata randomResults
    ) external onlyVRFCoordinator {
        uint256 length = requestIds.length;
        require(length == randomResults.length, "Array length mismatch");

        for (uint256 i = 0; i < length; ) {
            address player = requestToPlayer[requestIds[i]];
            if (player != address(0)) {
                uint32 roll = uint32((randomResults[i] % 6) + 1);
                playerStates[player].roll = roll;
                playerStates[player].timestamp = uint32(block.timestamp);

                delete requestToPlayer[requestIds[i]];
                emit DiceResult(requestIds[i], player, roll);
            }

            unchecked { ++i; } // Gas optimization for loop
        }
    }

    // View function to estimate callback gas
    function estimateCallbackGas() external view returns (uint256) {
        uint256 gasStart = gasleft();

        // Simulate callback operations
        GameState memory tempState = GameState({
            roll: 1,
            timestamp: uint32(block.timestamp),
            playerId: uint192(uint256(uint160(msg.sender)))
        });

        // Estimate storage operations
        uint256 storageGas = 20000; // SSTORE for new value
        uint256 eventGas = 2000;    // LOG operation
        uint256 computeGas = 1000;  // Arithmetic operations

        return storageGas + eventGas + computeGas + 10000; // Add buffer
    }
}
```

### Dynamic Gas Limit Adjustment

```solidity
contract AdaptiveGasDiceGame is VRFConsumerBaseV2 {
    uint32 public currentGasLimit = 500000;
    uint256 public averageGasUsed;
    uint256 public gasUsageSamples;

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
        internal override {
        uint256 gasStart = gasleft();

        // Callback logic...
        processRoll(requestId, randomWords[0]);

        // Track gas usage
        uint256 gasUsed = gasStart - gasleft();
        updateGasMetrics(gasUsed);

        // Suggest gas limit adjustment if needed
        if (gasUsed > currentGasLimit * 80 / 100) { // 80% threshold
            emit GasLimitTooLow(gasUsed, currentGasLimit);
        }
    }

    function updateGasMetrics(uint256 gasUsed) private {
        gasUsageSamples++;
        averageGasUsed = (averageGasUsed * (gasUsageSamples - 1) + gasUsed) / gasUsageSamples;

        // Suggest new gas limit (125% of average)
        uint32 suggestedLimit = uint32(averageGasUsed * 125 / 100);
        if (suggestedLimit != currentGasLimit) {
            emit GasLimitAdjustmentSuggested(currentGasLimit, suggestedLimit);
        }
    }

    function adjustGasLimit(uint32 newLimit) external onlyOwner {
        require(newLimit >= 100000 && newLimit <= 2500000, "Invalid gas limit");
        currentGasLimit = newLimit;
        emit GasLimitAdjusted(newLimit);
    }
}
```

---

## 11. Production Best Practices

### Access Control

```solidity
import "@openzeppelin/contracts/access/Ownable.sol";

contract ProductionDiceGame is VRFConsumerBaseV2, Ownable {
    bool public gamePaused = false;

    modifier whenNotPaused() {
        require(!gamePaused, "Game is paused");
        _;
    }

    function rollDice() external whenNotPaused returns (uint256) {
        // Game logic...
    }

    function pauseGame() external onlyOwner {
        gamePaused = true;
    }
}
```

### Event Monitoring

```solidity
// Comprehensive events for off-chain monitoring
event RequestFailed(uint256 indexed requestId, string reason);
event UnexpectedCallback(uint256 indexed requestId);
event GasLimitExceeded(uint256 indexed requestId, uint256 gasUsed);

// Monitor subscription health
event SubscriptionLowBalance(uint256 balance, uint256 threshold);
event SubscriptionRefilled(uint256 oldBalance, uint256 newBalance);
```

### Multi-Network Support

```solidity
contract MultiNetworkVRF is VRFConsumerBaseV2Plus {
    struct NetworkConfig {
        address vrfCoordinator;
        bytes32 keyHash;
        uint256 subscriptionId; // V2Plus uses uint256
        uint16 requestConfirmations;
        uint32 callbackGasLimit;
    }

    mapping(uint256 => NetworkConfig) public networkConfigs;
    uint256 public immutable CHAIN_ID;

    constructor(address vrfCoordinator) VRFConsumerBaseV2Plus(vrfCoordinator) {
        CHAIN_ID = block.chainid;
        _setupNetworkConfigs();
    }

    function _setupNetworkConfigs() private {
        // Ethereum Mainnet (V2Plus addresses)
        networkConfigs[1] = NetworkConfig({
            vrfCoordinator: 0xD7f86b4b8Cae7D942340FF628F82735b7a20893a, // V2Plus Mainnet
            keyHash: 0x8077df514608a09f83e4e8d300645594e5d7234665448ba83f37e09966216f78,
            subscriptionId: 0, // Set your actual subscription ID
            requestConfirmations: 3,
            callbackGasLimit: 500000
        });

        // Sepolia Testnet (V2Plus addresses)
        networkConfigs[11155111] = NetworkConfig({
            vrfCoordinator: 0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B, // V2Plus Sepolia
            keyHash: 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae,
            subscriptionId: 0, // Set your actual subscription ID
            requestConfirmations: 3,
            callbackGasLimit: 500000
        });

        // Polygon Mainnet
        networkConfigs[137] = NetworkConfig({
            vrfCoordinator: 0xAE975071Be8F8eE67addBC1A82488F1C24858067,
            keyHash: 0x6e099d640cde6de9d40ac749b4b594126b0169747122711109c9985d47751f93,
            subscriptionId: YOUR_POLYGON_SUB_ID,
            requestConfirmations: 15,
            callbackGasLimit: 500000
        });

        // BSC Mainnet
        networkConfigs[56] = NetworkConfig({
            vrfCoordinator: 0xc587d9053cd1118f25F645F9E08BB98c9712A4EE,
            keyHash: 0x17cd473250a9a479dc7f234c64332ed4bc8af9e8ded7556aa6e66d83da49f470,
            subscriptionId: YOUR_BSC_SUB_ID,
            requestConfirmations: 20,
            callbackGasLimit: 500000
        });
    }

    function getCurrentNetworkConfig() public view returns (NetworkConfig memory) {
        NetworkConfig memory config = networkConfigs[CHAIN_ID];
        require(config.vrfCoordinator != address(0), "Network not supported");
        return config;
    }

    function rollDice() external returns (uint256 requestId) {
        NetworkConfig memory config = getCurrentNetworkConfig();

        requestId = IVRFCoordinatorV2Plus(config.vrfCoordinator)
            .requestRandomWords(
                VRFV2PlusClient.RandomWordsRequest({
                    keyHash: config.keyHash,
                    subId: config.subscriptionId,
                    requestConfirmations: config.requestConfirmations,
                    callbackGasLimit: config.callbackGasLimit,
                    numWords: 1,
                    extraArgs: VRFV2PlusClient._argsToBytes(
                        VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                    )
                })
            );

        // Rest of logic...
    }
}
```

### Deployment Script for Multi-Network

```javascript
// scripts/deployMultiNetwork.js
const networkConfigs = {
  1: { name: "mainnet", subscriptionId: process.env.MAINNET_SUB_ID },
  11155111: { name: "sepolia", subscriptionId: process.env.SEPOLIA_SUB_ID },
  137: { name: "polygon", subscriptionId: process.env.POLYGON_SUB_ID },
  56: { name: "bsc", subscriptionId: process.env.BSC_SUB_ID },
};

async function main() {
  const chainId = network.config.chainId;
  const config = networkConfigs[chainId];

  if (!config) {
    throw new Error(`Network ${chainId} not supported`);
  }

  console.log(`Deploying to ${config.name} (Chain ID: ${chainId})`);

  const DiceGame = await ethers.getContractFactory("MultiNetworkDiceGame");
  const diceGame = await DiceGame.deploy();

  await diceGame.waitForDeployment();
  console.log(`DiceGame deployed to: ${await diceGame.getAddress()}`);

  // Verify network configuration
  const networkConfig = await diceGame.getCurrentNetworkConfig();
  console.log(`VRF Coordinator: ${networkConfig.vrfCoordinator}`);
  console.log(`Subscription ID: ${networkConfig.subscriptionId}`);
}
```

---

## 12. Beyond Dice: Advanced VRF Applications

### NFT Trait Generation

```solidity
function mintRandomNFT() external {
    uint256 requestId = requestRandomness();
    s_mintRequests[requestId] = msg.sender;
}

function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
    internal override {
    address minter = s_mintRequests[requestId];

    // Use multiple words for different traits
    uint256 background = randomWords[0] % 10;  // 0-9
    uint256 character = randomWords[1] % 50;   // 0-49
    uint256 accessory = randomWords[2] % 20;   // 0-19

    _mint(minter, background, character, accessory);
}
```

### Lottery Systems

```solidity
function drawWinner() external onlyOwner {
    require(players.length > 0, "No players");
    uint256 requestId = requestRandomness();
    s_lotteryRequests[requestId] = players.length;
}

function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
    internal override {
    uint256 playerCount = s_lotteryRequests[requestId];
    uint256 winnerIndex = randomWords[0] % playerCount;
    address winner = players[winnerIndex];

    _distributePrize(winner);
    _resetLottery();
}
```

### Procedural Game Content

```solidity
function generateDungeon() external {
    uint256 requestId = requestRandomness();
    s_dungeonRequests[requestId] = msg.sender;
}

function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
    internal override {
    address player = s_dungeonRequests[requestId];

    // Generate dungeon layout from multiple random values
    uint256 seed = randomWords[0];
    bytes32 dungeonData = _generateDungeonLayout(seed);

    s_playerDungeons[player] = dungeonData;
}
```

---

## 13. Real-World Attack Scenarios and Mitigations

Understanding actual attack vectors helps build more secure VRF implementations:

### Scenario 1: The Mempool Sniper

**Attack:** Attacker monitors mempool for VRF fulfillment transactions, calculates results, and front-runs with favorable bets.

```solidity
// ❌ VULNERABLE: Bet amount can be changed after seeing result
contract VulnerableLottery {
    mapping(uint256 => uint256) public betAmounts;

    function placeBet() external payable {
        uint256 requestId = requestRandomness();
        betAmounts[requestId] = msg.value; // Can be front-run!
    }
}

// ✅ SECURE: Commit-reveal prevents manipulation
contract SecureLottery {
    struct Commitment {
        bytes32 hashedBet;
        uint256 vrfRequestId;
        bool revealed;
    }

    function commitBet(bytes32 hashedBet) external {
        // Lock in commitment BEFORE requesting randomness
        commitments[msg.sender] = Commitment({
            hashedBet: hashedBet,
            vrfRequestId: requestRandomness(),
            revealed: false
        });
    }
}
```

### Scenario 2: The Subscription Drainer

**Attack:** Malicious contract added to subscription drains funds with spam requests.

```solidity
// ✅ MITIGATION: Rate limiting and access controls
contract ProtectedDiceGame {
    mapping(address => uint256) public lastRollTime;
    uint256 public constant ROLL_COOLDOWN = 10 seconds;

    function rollDice() external returns (uint256) {
        require(
            block.timestamp >= lastRollTime[msg.sender] + ROLL_COOLDOWN,
            "Cooldown active"
        );

        lastRollTime[msg.sender] = block.timestamp;
        return requestRandomness();
    }
}
```

### Scenario 3: The Reorg Manipulator

**Attack:** Large miner attempts to reorganize chain to change VRF input seed.

```solidity
// ✅ MITIGATION: Sufficient confirmations + value limits
contract ReorgResistantGame {
    uint16 public constant HIGH_VALUE_CONFIRMATIONS = 12;
    uint16 public constant STANDARD_CONFIRMATIONS = 3;
    uint256 public constant HIGH_VALUE_THRESHOLD = 10 ether;

    function requestRandomness(uint256 gameValue) internal returns (uint256) {
        uint16 confirmations = gameValue > HIGH_VALUE_THRESHOLD
            ? HIGH_VALUE_CONFIRMATIONS
            : STANDARD_CONFIRMATIONS;

        return i_vrfCoordinator.requestRandomWords(
            i_keyHash,
            i_subscriptionId,
            confirmations, // Dynamic based on value at risk
            i_callbackGasLimit,
            1
        );
    }
}
```

### Scenario 4: The Callback Griefing Attack

**Attack:** Attacker makes VRF requests designed to cause callback failures, wasting oracle gas.

```solidity
// ✅ MITIGATION: Graceful failure handling
contract RobustDiceGame {
    mapping(uint256 => bool) public failedRequests;

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
        internal override {
        try this.processRandomResult(requestId, randomWords[0]) {
            // Success path
        } catch {
            // Mark as failed but don't revert
            failedRequests[requestId] = true;
            emit RequestProcessingFailed(requestId);
        }
    }

    // External function for controlled processing
    function processRandomResult(uint256 requestId, uint256 randomResult) external {
        require(msg.sender == address(this), "Internal only");

        // Complex game logic that might fail
        address player = s_rollers[requestId];
        require(player != address(0), "Invalid request");

        uint256 roll = (randomResult % 6) + 1;
        s_results[player] = roll;

        emit DiceResult(requestId, player, roll);
    }

    // Allow manual retry of failed requests
    function retryFailedRequest(uint256 requestId) external onlyOwner {
        require(failedRequests[requestId], "Request not failed");
        // Retry logic...
    }
}
```

---

## Conclusion: Building Trust Through Verifiable Randomness

Chainlink VRF transforms blockchain gaming by providing cryptographically secure randomness that players can verify and trust. By implementing the patterns in this guide, you're building games where outcomes are provably faira cornerstone of trustworthy Web3 gaming.

**Key Takeaways:**

- VRF provides verifiable randomness that's impossible to manipulate
- Use commit-reveal patterns to prevent input manipulation
- Keep callback functions simple to avoid failures
- Monitor subscription balances and gas usage in production
- Test thoroughly on testnets before mainnet deployment
- Implement proper access controls and rate limiting
- Plan for edge cases like reorgs and callback failures

**Remember:** Security in randomness isn't just about the technologyit's about building player confidence in the fairness of your game.

---

**Ready to implement VRF in your smart contract? [Try the Dice Game Challenge!](/challenge/dice-game)**

**Want to learn more about smart contract security? [Check out the Blockchain Games Security Guide!](/guides/blockchain-games-vulnerabilities)**

**Building an NFT application? [Explore NFT Use Cases Beyond Art!](/guides/nft-use-cases)**
