---
title: "Solidity Contract-to-Contract Interactions Guide"
description: "A practical guide to Solidity contract-to-contract interactions. Learn how contracts call each other, handle errors, and manage security. Includes code patterns, pitfalls, and best practices."
image: "/assets/guides/contract-interactions.jpg"
---

## TL;DR: Secure Contract-to-Contract Interactions in Solidity

- **Smart contracts rarely operate alone**: secure, reliable contract-to-contract calls are the backbone of composable dApps.
- **Direct calls** are safest for known interfaces; **low-level calls** (call, delegatecall, staticcall) offer flexibility but require extra caution.
- **ERC20 approve/transferFrom** is the standard for delegated token transfers between contracts. Check this guide for more information: [ERC20 Approve/TransferFrom Pattern: How Token Allowances Work in Solidity](/guides/erc20-approve-pattern)
- **Security best practices:** Always check return values, use the [Checks-Effects-Interactions (CEI) pattern](https://docs.soliditylang.org/en/latest/security-considerations.html#reentrancy), and protect against reentrancy with guards like OpenZeppelin's `ReentrancyGuard`.
- **Treat all external contracts as untrusted**: defensive coding is essential.

---

## 1. Why Contract-to-Contract Interactions Matter

Solidity smart contracts are the building blocks of Ethereum dApps. But the real power of Web3 comes from how these contracts interact, enabling everything from DeFi protocols to NFT marketplaces and token vendors. Understanding secure contract-to-contract communication is essential for any developer aiming to build robust, composable, and secure decentralized applications.

> **Smart contracts are composable, but every contract you interact with is a potential risk.**
>
> - When your contract calls another, you trust its code to behave as expected. If it's buggy or malicious, your contract (and users) can be at risk.
> - Always treat external contracts (including standard tokens) as untrusted unless you've audited them yourself.

---

## 2. Core Patterns for Contract Interactions in Solidity

### 2.1 Direct Contract Calls (Recommended for Known Interfaces)

Direct calls are the most common and safest way for one contract to interact with another when the interface is known at compile time.

**Example:**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ICounter {
    function increment() external;
    function getCount() external view returns (uint256);
}

contract Caller {
    ICounter public counter;
    constructor(address counterAddress) {
        counter = ICounter(counterAddress);
    }
    function callIncrement() external {
        counter.increment();
    }
    function readCount() external view returns (uint256) {
        return counter.getCount();
    }
}
```

- **Pros:** Easy to read, automatic error propagation, type safety.
- **Cons:** Requires interface at compile time.

### 2.2 Low-Level Calls: `call`, `delegatecall`, `staticcall`

Low-level calls are powerful but riskier. Use them only when you need dynamic interactions or proxy patterns.

- `call`: Generic external call, can send Ether, must check return value.
- `delegatecall`: Runs code from another contract in the caller's context (used for upgradeable proxies).
- `staticcall`: Like `call`, but enforces read-only (view/pure) execution.

**Example:**

```solidity
(bool success, bytes memory data) = targetAddress.call(abi.encodeWithSignature("doSomething(uint256)", 123));
require(success, "External call failed");
```

> **Security Tip:** Always check the `success` flag when using low-level calls. Never assume the call succeeded!

**Quick Comparison Table: Low-Level Calls**

<table>
  <thead>
    <tr>
      <th>Feature</th>
      <th>call()</th>
      <th>delegatecall()</th>
      <th>staticcall()</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Execution Context</td>
      <td>Callee</td>
      <td>Caller (callee code)</td>
      <td>Callee</td>
    </tr>
    <tr>
      <td>msg.sender</td>
      <td>Caller contract</td>
      <td>Original sender</td>
      <td>Caller contract</td>
    </tr>
    <tr>
      <td>Storage Access</td>
      <td>Callee</td>
      <td>Caller</td>
      <td>Callee (read-only)</td>
    </tr>
    <tr>
      <td>State Modification</td>
      <td>Allowed</td>
      <td>Allowed (in caller)</td>
      <td>Disallowed</td>
    </tr>
    <tr>
      <td>Use Case</td>
      <td>Generic calls</td>
      <td>Proxies, upgrades</td>
      <td>Safe data reads</td>
    </tr>
    <tr>
      <td>Key Risk</td>
      <td>Reentrancy, unchecked errors</td>
      <td>Storage collision, unchecked errors</td>
      <td>Unchecked errors</td>
    </tr>
  </tbody>
</table>

> **Storage collision warning:** If you use `delegatecall` for upgradeable contracts, your storage layout must match exactly between proxy and logic contracts, or you risk corrupting your contract's state.

---

## 3. ERC20 Token Interactions: The Approve/TransferFrom Pattern

Most dApps need to move tokens between users and contracts. The ERC20 `approve`/`transferFrom` workflow is the standard for delegated transfers.

**How it works:**

1. **User calls `approve(spender, amount)`** on the token contract, allowing the contract (e.g., a vendor) to spend tokens on their behalf.
2. **Contract calls `transferFrom(user, contract, amount)`** to pull tokens from the user.

**Example:**

```solidity
IERC20 public paymentToken;

function buy(uint256 amount) external {
    // User must have approved this contract for at least `amount`
    bool success = paymentToken.transferFrom(msg.sender, address(this), amount);
    require(success, "Token transfer failed");
    // ... business logic ...
}
```

- **Always check the return value** of `transferFrom` and `transfer`.
- **Never assume** all ERC20s behave identically. Defensive coding is a must.

### 3.1 Infinite Approvals & ERC20 Trust

- **Infinite approvals** (users approving max uint256) are common for convenience, but dangerous if the contract is ever compromised.
- Not all ERC20s behave identically. Some have non-standard logic or bugs. Always check return values and code defensively.

We'll cover this pattern in more detail in the [ERC20 Approve Pattern guide](/guides/erc20-approve-pattern).

---

## 4. Security Best Practices for Contract Interactions

### 4.1 Checks-Effects-Interactions (CEI) Pattern

Update your contract's state **before** making any external calls. This prevents reentrancy attacks.

**Example:**

```solidity
function withdraw(uint256 amount) external {
    require(balances[msg.sender] >= amount, "Insufficient balance");
    balances[msg.sender] -= amount; // Effect
    (bool sent, ) = msg.sender.call{value: amount}(""); // Interaction
    require(sent, "Withdraw failed");
}
```

### 4.2 Use Reentrancy Guards

Add OpenZeppelin's `ReentrancyGuard` and the `nonReentrant` modifier to functions that make external calls and change state.

```solidity
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SafeBank is ReentrancyGuard {
    mapping(address => uint256) public balances;
    function withdraw(uint256 amount) external nonReentrant {
        require(balances[msg.sender] >= amount, "Insufficient");
        balances[msg.sender] -= amount;
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Withdraw failed");
    }
}
```

### 4.3 Treat All External Contracts as Untrusted

- Never assume another contract is safe, even if it's a standard like ERC20.
- Always check return values and handle errors gracefully.
- Avoid state changes **after** external calls.

### 4.4 Types of Reentrancy (Know Your Enemy)

- **Single-function reentrancy:** Attacker re-enters the same function.
- **Cross-function reentrancy:** Attacker re-enters a different function in the same contract.
- **Cross-contract reentrancy:** Attacker re-enters via another contract.

> **Always use the Checks-Effects-Interactions (CEI) pattern and a reentrancy guard (like OpenZeppelin's) for any function that makes external calls and changes state.**

### 4.5 Error Handling & Gas Management

- **Low-level calls** (`call`, `delegatecall`, `staticcall`) do NOT revert on failure. Always check the `success` flag.
- When using low-level calls, decode return data carefully with `abi.decode`.
- Be aware of gas usage: external calls can consume unpredictable gas, especially with non-standard tokens.

---

## 5. Practical Example: Secure Token Vendor Contract

A token vendor is a classic example of contract-to-contract interaction. It must securely accept payment tokens and dispense another token.

**Key features:**

- Uses `approve`/`transferFrom` for payments
- Dispenses tokens only after successful payment
- Follows CEI and uses `ReentrancyGuard`

**Example:**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract TokenVendor is ReentrancyGuard {
    IERC20 public immutable paymentToken;
    IERC20 public immutable vendedToken;
    uint256 public price;
    address public owner;

    event TokensPurchased(address indexed buyer, uint256 amount, uint256 cost);

    constructor(address _paymentToken, address _vendedToken, uint256 _price) {
        paymentToken = IERC20(_paymentToken);
        vendedToken = IERC20(_vendedToken);
        price = _price;
        owner = msg.sender;
    }

    function buyTokens(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be positive");
        uint256 cost = amount * price;
        require(vendedToken.balanceOf(address(this)) >= amount, "Not enough tokens");
        bool paid = paymentToken.transferFrom(msg.sender, address(this), cost);
        require(paid, "Payment failed");
        bool sent = vendedToken.transfer(msg.sender, amount);
        require(sent, "Token transfer failed");
        emit TokensPurchased(msg.sender, amount, cost);
    }
}
```

---

## 6. Build Secure, Composable dApps

Mastering contract-to-contract interactions is essential for any Solidity developer. Use direct calls for known interfaces, low-level calls with caution, and always follow security best practices. Defensive coding, thorough testing, and regular audits are your best tools for building secure, reliable, and composable smart contracts.

### 6.1 Testing, Audits & Continuous Security

> **Security is never "done."**
>
> - Always write thorough tests, including edge cases and attack scenarios.
> - Get independent audits for any contract that will hold real value.
> - Stay up-to-date with new vulnerabilities and best practices.

---

**Ready to put these patterns into practice? [Try the Token Vendor Challenge!](/challenge/token-vendor)**
