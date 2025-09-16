---
title: "ERC4626 Vaults: Secure Design, Risks & Best Practices"
description: "Developer guide to ERC4626 vaults: core functions, key risks (inflation, reentrancy, oracle), and secure fees, caps, queues with Solidity examples."
image: "/assets/guides/erc4626-vaults.jpg"
---

## TL;DR:

- **ERC4626 standardizes tokenized vaults**: deposit assets, mint shares, then redeem shares for assets.
- **Security hinges on `totalAssets()`**: it drives pricing for `convertToShares`/`convertToAssets`.
- **Top risks**: first-depositor inflation, reentrancy, fee-on-transfer/rebasing tokens, oracle manipulation, rounding drift.
- **Custom features** (fees, caps, queues, RBAC) add complexity. Design cautiously, test heavily.
- **Build with audited libs**, implement [Checks-Effects-Interactions(CEI)](https://docs.soliditylang.org/en/latest/security-considerations.html#reentrancy) + reentrancy guards (see [OpenZeppelin ReentrancyGuard](https://docs.openzeppelin.com/contracts/5.x/api/security#ReentrancyGuard)), and write invariants/fuzz tests.

---

## 1. What Is ERC4626?

[ERC4626](https://eips.ethereum.org/EIPS/eip-4626) (Tokenized Vault Standard) unifies how vaults issue transferable “shares” representing a proportional claim on underlying assets. This makes integrations easier across DeFi.

Core interface highlights:

- `asset()`: underlying token address
- `totalAssets()`: total managed assets
- `convertToShares(assets)` / `convertToAssets(shares)`
- `deposit`, `mint`, `withdraw`, `redeem`

> Tip: In most vaults, the share price is implicitly `totalAssets() / totalSupply()`. Precision and rounding rules matter.

![ERC4626 asset/share flow with strategy yield loop](/assets/guides/erc4626-asset-share-flow-diagram.png)

_Figure: ERC4626 flow: deposit assets to mint shares, redeem shares to withdraw assets, and strategies feed yield back to the vault._

---

## 2. Why totalAssets() Is Critical

All pricing flows through `totalAssets()`. If it’s wrong or manipulable, `convertToShares`/`convertToAssets` will misprice deposits and redemptions.

Common pitfalls:

- Treating `totalAssets()` as simply `asset.balanceOf(address(this))` when assets can be sent directly or deployed into strategies.
- Ignoring strategy PnL, fees, or pending accruals.
- Relying on fragile oracles for complex positions (e.g., LP tokens).

Best practices:

- Include only assets truly attributable to shareholders.
- Carefully reconcile direct transfers and strategy balances.
- If using oracles, add sanity checks, TWAPs, and circuit breakers.

![Sequence: deposit/redeem using totalAssets with oracle sanity checks](/assets/guides/erc4626-totalassets-oracle-sequence-diagram.png)

_Figure: totalAssets() drives conversions, and oracle reads should be sanity-checked and resistant to manipulation._

---

## 3. Common ERC4626 Vulnerabilities (and Fixes)

<table>
  <thead>
    <tr>
      <th>Vulnerability</th>
      <th>Attack Vector</th>
      <th>Impact</th>
      <th>Mitigations</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Share Price Manipulation</strong></td>
      <td>First depositor mints 1 share, then sends large assets directly</td>
      <td>Subsequent users get tiny shares and the attacker exits with most assets</td>
      <td>Seed with non-trivial liquidity, use virtual shares/assets, require a minimum deposit, and make `totalAssets()` robust</td>
    </tr>
    <tr>
      <td><strong>Direct Transfers to Vault</strong></td>
      <td>Assets sent to vault address outside `deposit()`</td>
      <td>Skews `totalAssets()` and share pricing if not reconciled</td>
      <td>Reconcile external transfers, ignore unsolicited assets, or handle them with controlled accounting</td>
    </tr>
    <tr>
      <td><strong>Reentrancy</strong></td>
      <td>ERC777 hooks or external calls inside hooks</td>
      <td>State corruption, theft</td>
      <td>Follow CEI and `nonReentrant`, and minimize or guard external calls</td>
    </tr>
    <tr>
      <td><strong>Hook-based Reentrancy</strong></td>
      <td>Custom `beforeWithdraw`/`afterDeposit` hooks call out</td>
      <td>Cross-function reentry into sensitive logic</td>
      <td>Avoid external calls in hooks, or guard hook paths with `nonReentrant` and strict CEI</td>
    </tr>
    <tr>
      <td><strong>Non-standard Assets</strong></td>
      <td>Fee-on-transfer or rebasing tokens</td>
      <td>Price drift, accounting mismatches</td>
      <td>Use actual-received amounts, adapt math to rebasing, and prefer wrapped tokens or disallow incompatible assets</td>
    </tr>
    <tr>
      <td><strong>Oracle Manipulation</strong></td>
      <td>Spot price manipulation or downtime</td>
      <td>Cheap mints / expensive redemptions</td>
      <td>Use decentralized oracles, TWAPs, deviation checks, and circuit breakers</td>
    </tr>
    <tr>
      <td><strong>Rounding & Precision</strong></td>
      <td>Integer division in conversions</td>
      <td>Dust accumulation, unfairness</td>
      <td>Multiply before divide, use conservative rounding, and add fuzz tests</td>
    </tr>
    <tr>
      <td><strong>DoS & Gas</strong></td>
      <td>Complex strategies in deposit/withdraw</td>
      <td>TX failures under load</td>
      <td>Optimize strategies, isolate heavy operations, and profile gas</td>
    </tr>
    <tr>
      <td><strong>Malicious Token Behavior</strong></td>
      <td>Tokens revert/blacklist on `transfer/transferFrom`</td>
      <td>Deposits/withdrawals can brick</td>
      <td>Vet assets, use `SafeERC20`, and allow admins to disable or unwrap problematic tokens</td>
    </tr>
    <tr>
      <td><strong>MEV Timing / Front-running</strong></td>
      <td>Front-running deposits before a large, profitable `harvest()` and back-running withdrawals immediately after</td>
      <td>Attacker captures yield without long-term risk, diluting returns for legitimate LPs</td>
      <td>Smooth accruals over time, use private transactions for harvests (for example, Flashbots), and consider short-term withdrawal lockups or fees</td>
    </tr>
  </tbody>
</table>

---

## 4. Secure Customization Patterns

- **Fees (management/performance/exit):** Accrue at harvest/checkpoints and sweep to a fee recipient, or mint fee shares strictly against realized gains to avoid ongoing price distortion. Keep pricing deterministic for users.
- **Caps (global/per-user):** Use checks in `deposit/mint` to throttle TVL or user concentration.
- **Withdrawal Queues/Gates:** Model FIFO requests for illiquid strategies. Enforce fairness and anti-gaming (e.g., per-address caps, snapshots). Reflect gating in `maxRedeem` and previews.
- **RBAC:** Protect all admin functions (fees, caps, strategies, pausing) using `AccessControl` and multisigs. Consider timelocks.
- **Pause/Circuit Breakers:** Add pausable paths and emergency stops if oracles fail or strategies misbehave.

---

![Customization flow: caps, harvest, fee accrual/sweep, RBAC controls](/assets/guides/erc4626-customization-caps-fees-rbac-diagram.png)

_Figure: Customization flow with caps, fee accrual and sweep, and RBAC controls._

## 5. Solidity Example: Guarded Deposit/Withdraw Skeleton

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "./ERC4626.sol"; // Your base implementation (e.g., Solmate/OZ style)

interface IERC4626Minimal {
    function asset() external view returns (address);
    function previewDeposit(uint256 assets) external view returns (uint256 shares);
    function previewWithdraw(uint256 assets) external view returns (uint256 shares);
    function totalAssets() external view returns (uint256);
}

contract SecureVault is ReentrancyGuard {
    IERC4626Minimal public immutable vault; // wrap/extend your base ERC4626
    IERC20 public immutable underlying;

    // Custom errors for gas-efficient reverts
    error ZeroAssets();
    error ZeroShares();
    error TransferInFailed();
    error TransferOutFailed();

    constructor(IERC4626Minimal _vault) {
        vault = _vault;
        underlying = IERC20(_vault.asset());
    }

    function deposit(uint256 assets, address receiver) external nonReentrant returns (uint256 shares) {
        if (assets == 0) revert ZeroAssets();
        shares = vault.previewDeposit(assets);
        if (shares == 0) revert ZeroShares();
        // Pull tokens AFTER computing shares; follow CEI
        bool ok = underlying.transferFrom(msg.sender, address(this), assets);
        if (!ok) revert TransferInFailed();
        // Forward to underlying vault or perform accounting, then mint shares (in your ERC4626 impl)
        return shares;
    }

    function withdraw(uint256 assets, address receiver, address owner) external nonReentrant returns (uint256 shares) {
        if (assets == 0) revert ZeroAssets();
        shares = vault.previewWithdraw(assets);
        // Burn shares and push assets out in your ERC4626 impl
        bool ok = underlying.transfer(receiver, assets);
        if (!ok) revert TransferOutFailed();
        return shares;
    }
}
```

> Note: Treat this as a skeleton for CEI + `nonReentrant` flow and preview-based pricing. Build atop a well-audited ERC4626 base.

---

![CEI + nonReentrant deposit/withdraw with previews and token transfers](/assets/guides/erc4626-cei-nonreentrant-sequence-diagram.png)

_Figure: CEI + nonReentrant skeleton: previews drive pricing, and token transfers occur after state calculations._

### Optional: RBAC and Simple Fee Handling (Illustrative)

```solidity
// Role example (names vary by project)
import "@openzeppelin/contracts/access/AccessControl.sol";

bytes32 constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
bytes32 constant FEE_SETTER_ROLE = keccak256("FEE_SETTER_ROLE");

contract Roles is AccessControl {
    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        _grantRole(FEE_SETTER_ROLE, admin);
    }
}
```

> Optional pattern: accrue fees when gains are realized (for example, after `harvest`), and base fees on realized PnL only.

```solidity
// Inside your ERC4626 vault (sketch)
uint256 public feeBps; // basis points, e.g. 100 = 1%
address public feeRecipient;

function _accrueFees(uint256 realizedGainAssets) internal {
    uint256 feeAssets = (realizedGainAssets * feeBps) / 10_000;
    if (feeAssets == 0) return;
    // Option A: mint fee shares against the gain
    uint256 feeShares = previewDeposit(feeAssets);
    _mint(feeRecipient, feeShares);
    // Option B: alternatively transfer assets to feeRecipient after harvest
    // IERC20 token = IERC20(asset()); // ERC4626 underlying asset
    // bool ok = token.transfer(feeRecipient, feeAssets);
    // if (!ok) revert TransferOutFailed();
}
```

---

## 6. Testing Playbook: Invariants, Fuzzing, Integrations

- **Unit tests:** Exercise all conversions and edge cases (zero, tiny, max values; varying decimals).
- **Fuzz tests:** Randomize deposit/withdraw sequences, asset behavior (fee-on-transfer, rebasing), and rounding.
- **Invariant tests:** Examples: `convertToAssets(convertToShares(x)) ~= x`; `sum(userShares) == totalSupply`; `totalAssets` tracks balances + strategies.
- **Integration tests:** Simulate strategies, oracle reads, and emergency paths (pauses, caps, queues).
- **Auditor Focus:** Verify `totalAssets()` correctness, share-price manipulation resistance, reentrancy protections, RBAC on all admin, and fee accounting.
- **Formal Verification (advanced):** Consider proving invariants for `totalAssets()` and conversion functions on critical deployments.

---

## 7. Best Practices Checklist

- **Use audited libraries** (Solmate, OpenZeppelin)
- **Initialize fairly** (seed liquidity or virtual shares)
- **Follow CEI** and add **`nonReentrant`**
- **Handle non-standard tokens** (actual received; rebasing math)
- **Harden `totalAssets()`** (no easy manipulation; oracle sanity)
- **Rounding discipline** (favor vault; multiply then divide)
- **Admin safety** (RBAC + multisig + timelocks)
- **Comprehensive tests** (unit, fuzz, invariants, integration)
- **Use `SafeERC20`** for transfers (from [OpenZeppelin SafeERC20](https://docs.openzeppelin.com/contracts/5.x/api/token/erc20#SafeERC20)) and validate return values consistently
- **Follow EIP-4626 rounding guidance** (conservative rounding that favors the vault)

---

## 8) Related Guides & Next Steps

- Learn secure token approvals: [ERC20 Approve Pattern](/guides/erc20-approve-pattern)
- Master cross-contract calls: [Solidity Contract-to-Contract Interactions](/guides/solidity-contract-to-contract-interactions)
- Understand LP risks: [Impermanent Loss Explained](/guides/impermanent-loss-math-explained)
- Build tokens first: [How to Create an ERC20 Token](/guides/how-to-create-erc20)

Ready to practice? Try the [Decentralized Staking Challenge](/challenge/decentralized-staking) in SpeedRunEthereum.
