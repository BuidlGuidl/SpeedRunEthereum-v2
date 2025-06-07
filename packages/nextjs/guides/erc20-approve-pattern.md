---
title: "ERC20 Approve Pattern: Secure Token Allowances Guide"
description: "A concise, developer-focused guide to the ERC20 approve pattern. Learn how token allowances work, common pitfalls, and best practices for secure dApp development and user safety. Includes Solidity examples and actionable tips."
---

## TL;DR: ERC20 Approve Pattern

- **ERC20's approve/allowance/transferFrom** enables dApps to move tokens _with your permission_.
- **Security risks:** Race conditions, infinite approvals, phishing, and forgotten allowances.
- **Best practices:** Use the "approve-to-zero-then-set" pattern, avoid unlimited approvals, leverage ERC20Permit if available, and regularly review allowances.
- **For devs:** Guide users to safe patterns, use OpenZeppelin, and educate on risks.

---

## 1. Why Token Approvals are Important

ERC20 tokens are the backbone of DeFi and dApps. But smart contracts can't just take your tokens, they need permission. The **approve pattern** lets you grant a contract (the "spender") the right to move a set amount of your tokens. This is essential for swaps, staking, lending, and more.

### Historical Context: Why Approve/TransferFrom Exists

The ERC20 approve/transferFrom pattern was designed in Ethereum's early days to solve a technical limitation: the EVM's call stack depth. By separating permission (approve) from action (transferFrom), smart contracts could avoid deep call chains and enable more flexible, composable DeFi protocols. Even after the EVM was improved, this pattern persisted due to network effects and backward compatibility.

---

## 2. How the ERC20 Approve Pattern Works

The ERC20 standard defines three key functions for delegated transfers:

- `approve(address spender, uint256 amount)`: Allow `spender` to spend up to `amount` of your tokens.
- `allowance(address owner, address spender)`: Check how much `spender` can spend from `owner`.
- `transferFrom(address from, address to, uint256 amount)`: Move tokens from `from` to `to` (if allowed).

**Typical flow:**

1. User calls `approve(spender, amount)` on the token contract.
2. dApp contract calls `transferFrom(user, dApp, amount)` to pull tokens.

**Solidity Example:**

```solidity
IERC20(token).approve(spender, amount); // User grants allowance
IERC20(token).transferFrom(user, dApp, amount); // dApp spends tokens
```

## 3. Common Pitfalls & Security Risks

<table>
  <thead>
    <tr>
      <th>Vulnerability</th>
      <th>Description & Impact</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Race Condition</strong></td>
      <td>Changing allowance (N→M) can be front-run: spender may use both old and new values.</td>
    </tr>
    <tr>
      <td><strong>Infinite Approval</strong></td>
      <td>Approving <code>type(uint256).max</code> lets a contract drain all your tokens if compromised.</td>
    </tr>
    <tr>
      <td><strong>Phishing</strong></td>
      <td>Malicious dApps trick users into approving attacker contracts.</td>
    </tr>
    <tr>
      <td><strong>Forgotten Approvals</strong></td>
      <td>Old, unused allowances remain active—potential attack surface.</td>
    </tr>
    <tr>
      <td><strong>Zero Address Approval</strong></td>
      <td>Approving the zero address is usually meaningless and may indicate a user error. Robust tokens prevent this, but not all do—always check spender addresses.</td>
    </tr>
  </tbody>
</table>

> **UI Spoofing Warning:** Attackers may use fake UIs or compromised frontends to trick you into approving malicious contracts. Always double-check spender addresses and be wary of unexpected approval requests.

### Real-World Exploits: Why Security Matters

- **SHOPX Protocol (2022):** Lost $7M due to an unlimited approval exploit—attackers drained user wallets after a contract vulnerability.
- **bZx Flash Loan Attacks (2020):** $14M lost, partly due to excessive token allowances.
- **Ledger Connect Kit (2023):** Phishing attack prompted users for unlimited approvals, leading to stolen funds.
- **Li.Fi Protocol (2024):** $9.7M lost due to a contract vulnerability exploited via existing infinite user approvals.
- **ParaSwap (2024):** Vulnerability in Augustus V6 contract led to user losses; users with prior approvals were affected.
- **SenecaUSD (2024):** $6.5M lost; attacker exploited a contract flaw to drain tokens from users who had approved the contract.
- **SocketDotTech (Bungee) (2024):** $3.3M lost; incomplete input validation allowed draining of tokens from users with infinite approvals.
- **ConcentricFi (2024):** $1.72M lost after attackers gained control of upgradeable contracts; users were advised to revoke approvals.
- **Phishing Attacks (2023-2024):** Surge in phishing campaigns targeting users to sign malicious Permit (EIP-2612) or Permit2 signatures, resulting in multi-million dollar losses. Always scrutinize signature requests, not just on-chain transactions.

These incidents show that improper use of approve/allowance can have devastating consequences. Always treat token approvals as high-stakes permissions.

---

## 4. Best Practices for Developers

- **Mitigate Race Conditions:**
  - Use the "approve-to-zero-then-set" pattern when changing nonzero allowances:
    ```solidity
    if (token.allowance(msg.sender, spender) != 0) {
        token.approve(spender, 0);
    }
    token.approve(spender, newAmount);
    ```
  - **Note:** OpenZeppelin removed `increaseAllowance`/`decreaseAllowance` from their core ERC20 in v5.x. If you need atomic allowance changes, you'll need to implement them yourself or use an extension.
- **Avoid Infinite Approvals:**
  - Request only the amount needed for each operation.
  - If infinite approval is necessary, clearly warn users and ensure your contract is audited and immutable.
- **Leverage ERC20Permit (EIP-2612):**
  - If supported, use `permit()` for gasless, signature-based approvals—improves UX and security.
- **Leverage Permit2 for Universal Signature Approvals:**
  - [Permit2](https://docs.uniswap.org/contracts/permit2/overview) (by Uniswap) enables signature-based approvals for any ERC20 token, even those not supporting EIP-2612. Users grant a one-time approval to the Permit2 contract, then sign off-chain messages for granular, time-limited approvals to DApps. This improves UX but introduces a powerful master approval—users and DApps must treat Permit2 with the same caution as any major contract. Always verify spender addresses and signature details.
- **Explore Temporary Approvals (ERC-7674):**
  - The emerging [ERC-7674](https://eips.ethereum.org/EIPS/eip-7674) standard enables temporary, transaction-scoped approvals using EIP-1153 transient storage. This pattern, once widely adopted, will allow for highly secure, single-transaction approvals that vanish after use, reducing the risk of standing permissions.
- **Use OpenZeppelin Libraries:**
  - Rely on audited contracts (`IERC20`, `SafeERC20`) for robust, standard-compliant code.
  - **SafeERC20 Note:** The behavior of `safeApprove` and related functions can vary by OpenZeppelin version. Always check your version's docs for details. As of v5.x, `safeApprove` is deprecated; use `safeIncreaseAllowance`/`safeDecreaseAllowance` for atomic changes.
  - **OpenZeppelin v5.x Developer Note:** OpenZeppelin v5.x (2023+) removes SafeMath (now built into Solidity), removes token hooks (replaced by a unified `_update` function), introduces custom errors for gas efficiency, and implements namespaced storage for upgradeable contracts. Review the [OpenZeppelin v5.0 changelog](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/CHANGELOG.md) before upgrading or customizing contracts.
- **Educate Users:**
  - Clearly explain what permissions are being requested and why.
  - Encourage users to review and revoke allowances when no longer needed.
- **General Security Hygiene:**
  - Use reentrancy guards where appropriate, validate all inputs (especially addresses), and always use audited libraries for token interactions.

### Advanced Mitigation Strategies

- **Time-Limited Allowances:** Some advanced protocols (or future EIPs) may allow approvals that expire after a set time, reducing risk from forgotten permissions.
- **Contract-Managed Allowances:** Smart contracts that approve other contracts should periodically review and revoke unnecessary allowances to minimize attack surface.
- **ERC20Permit (EIP-2612):** Enables gasless, signature-based approvals that can be combined atomically with token usage, reducing race condition risk and improving UX.

### Solidity Example: Safe Allowance Update Helper

Here's a helper function for users or dApps to safely update an allowance, following the approve-to-zero-then-set pattern:

```solidity
function safeApprove(IERC20 token, address spender, uint256 newAmount) external {
    uint256 current = token.allowance(msg.sender, spender);
    if (current != 0) {
        require(token.approve(spender, 0), "Approve to zero failed");
    }
    require(token.approve(spender, newAmount), "Approve to new amount failed");
}
```

> **Note:** The `safeApprove` function in OpenZeppelin's SafeERC20 library is now deprecated due to potential race conditions. For atomic allowance changes, use `safeIncreaseAllowance` and `safeDecreaseAllowance` where possible. Always consult the latest [OpenZeppelin documentation](https://docs.openzeppelin.com/contracts/5.x/api/token/erc20) for best practices.

---

## 5. Best Practices for Users

- **Review Allowances Regularly:**
  - Use tools like [Etherscan Token Approvals](https://etherscan.io/tokenapprovalchecker), [Revoke.cash](https://revoke.cash/), [Debank](https://debank.com/), or [Unrekt](https://unrekt.net/) to see and revoke active approvals across multiple chains.
  - **Note:** Revoking an approval is an on-chain transaction and costs gas. Disconnecting your wallet from a dApp does **not** revoke approvals—they remain active until explicitly revoked.
- **Be Skeptical of Unlimited Approvals:**
  - Only grant unlimited access to highly trusted, audited contracts.
- **Verify Spender Addresses:**
  - Double-check contract addresses before approving—beware of phishing sites.
- **Understand What You're Signing:**
  - Read wallet prompts carefully. Don't rush through approvals. **Phishing attacks now frequently target Permit (EIP-2612) and Permit2 signatures, not just on-chain transactions.** Always verify the details of any signature request, including spender, amount, and contract address. If your wallet displays unclear or hex-only data, treat it as a red flag.

---

## 6. Practical Example: Selling Tokens to a Vendor Contract

**Scenario:** You want to sell your ERC20 tokens to a dApp (e.g., a TokenVendor).

1. **Approve the dApp:**
   ```solidity
   IERC20(token).approve(address(tokenVendor), amountToSell);
   ```
2. **Call the dApp's function:**
   ```solidity
   tokenVendor.sellTokens(amountToSell);
   // Inside sellTokens, the contract calls transferFrom(user, vendor, amountToSell)
   ```

**Tip:** If you approve but never call `sellTokens`, your approval remains active—revoke it if not needed.

---

## 7. Quick Reference: Secure Approve Patterns

<table>
  <thead>
    <tr>
      <th>Pattern</th>
      <th>When to Use</th>
      <th>Security Benefit</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Approve-to-zero-then-set</td>
      <td>Changing existing approval</td>
      <td>Prevents race condition</td>
    </tr>
    <tr>
      <td>Exact-amount approval</td>
      <td>All approvals</td>
      <td>Limits risk if contract exploited</td>
    </tr>
    <tr>
      <td>ERC20Permit (if available)</td>
      <td>Modern tokens</td>
      <td>Gasless, atomic, safer UX</td>
    </tr>
    <tr>
      <td>Regular allowance review</td>
      <td>All users</td>
      <td>Reduces attack surface</td>
    </tr>
  </tbody>
</table>

## 8. Forward-Looking: The Future of Approvals and Account Abstraction

The future of token approval security is evolving rapidly:

- **Temporary Approvals (ERC-7674):** Transaction-scoped approvals will reduce the risk of standing permissions and may become standard as EIP-1153 and EIP-7702 (account abstraction for EOAs) gain adoption.
- **Account Abstraction (EIP-4337, EIP-7702):** Smart contract wallets will enable more programmable, granular, and secure approval flows, including multi-factor and time-limited permissions.
- **Wallet UX Improvements:** Expect more intelligent warnings, clearer signature displays, and automated monitoring of approvals in leading wallets.
- **Security Automation:** Tools that alert users to risky approvals or known malicious contracts will become more common.

Staying current with these trends—and adopting new standards and tools as they mature—will be essential for both users and developers to maintain security in the evolving DeFi landscape.

---

**Want to practice? [Try the Token Vendor Challenge!](/challenge/token-vendor)**

**Ready for more? [Build a DEX with the Minimum Viable Exchange Challenge!](/challenge/minimum-viable-exchange)**
