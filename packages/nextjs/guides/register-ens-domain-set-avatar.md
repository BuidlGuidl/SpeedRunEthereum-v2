---
title: "How to Register an ENS Address and Set Your ENS Avatar"
description: "Step-by-step guide to register an ENS address (.eth), secure your Web3 identity, and set an ENS avatar. Covers pricing, commit–reveal, reverse resolution, and best practices."
image: "/assets/guides/how-to-register-ens-set-avatar.jpg"
---

## TL;DR:

- **Register ENS address (.eth)** at the [official app](https://app.ens.domains), then complete the 2‑tx commit–reveal flow
- **Pricing:** $5/yr (5+ chars), $160/yr (4 chars), $640/yr (3 chars) + gas.
- **Set Primary Name (reverse record)** to map your wallet → `yourname.eth`
- **Set ENS avatar** via NFT (eip155 URI), IPFS (`ipfs://...`), or HTTPS (`https://...`) in text records
- Use a **fresh address** if you want to avoid linking prior on‑chain history
- Bookmark **renewal reminders**; consider multi‑year registrations (renew anytime). After expiration: 90‑day grace, then a premium decay, then normal price

---

## 1. What Is ENS and Why It Matters

ENS (Ethereum Name Service) lets you replace `0x...` addresses with a **human‑readable name** like `developer.eth`. Your ENS name can also store **profile data** (avatar, links, social handles) and works across wallets and dapps as your **portable Web3 identity**.

---

## 2. Prerequisites

- A non‑custodial wallet (e.g., MetaMask, Rainbow, Coinbase Wallet)
- A small amount of ETH for the annual fee and gas (can be paid with credit and debit card)
- Optional: Use a fresh wallet if you don’t want to publicly link past transactions

---

<span id="3-how-to-register-an-ens-address-eth"></span>

## 3. How to Register an ENS Address (.eth)

You’ll use the official **ENS Manager** at [ENS App](https://app.ens.domains) and complete a secure, two‑step process ([commit -> reveal](/guides/commit-reveal-scheme)) that prevents front‑running.

### 3.1. Search and select your name

- Go to [ENS App](https://app.ens.domains) and search for your desired `.eth` name
- Choose the registration duration, can pick by years or by date. For longer durations the impact of gas fees is lower.

![Search for a .eth name in the ENS App](/assets/guides/search-ens-domain.jpg)
_Figure: Search for a name and see availability._

### 3.2. Request to Register (Commit)

- Click “Request to Register” and confirm the first transaction (0 ETH + gas)
- This posts a cryptographic commitment (your name + a secret) on‑chain

![Select years and set Primary Name during checkout](/assets/guides/register-ens-domain.jpg)
_Figure: Choose registration duration and optionally set your Primary Name._

### 3.3. Wait ~60 seconds

- ENS requires a short delay so the commitment finalizes on‑chain

### 3.4. Complete Registration (Reveal)

- Click “Register” and confirm the second transaction (registration fee + gas)
- The name is minted as an NFT to your wallet upon confirmation

### 3.5. Pro tips

- The commitment is valid for ~24 hours; finish the reveal in time
- You can register for multiple years to reduce renewal overhead
- Can pay with credit and debit card if you don't have ETH

> **Primary Name not showing in dapps?**
>
> Ensure the reverse record (Primary Name) is set to your ENS and your wallet is connected on the same chain

---

## 4. Pricing and Annual Costs

Annual fee (USD‑pegged, paid in ETH at time of tx):

<table>
  <thead>
    <tr>
      <th>Name Length</th>
      <th>Annual Fee (USD)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>5+ characters</td>
      <td>$5</td>
    </tr>
    <tr>
      <td>4 characters</td>
      <td>$160</td>
    </tr>
    <tr>
      <td>3 characters</td>
      <td>$640</td>
    </tr>
  </tbody>

</table>

You’ll also pay gas for the two transactions. Renewals follow the same pricing.

> **Important:** After expiration, there’s a 90‑day grace period. If not renewed, the name enters Temporary Premium. Anyone can register it during this phase by paying the listed premium, which decays back to the normal price.

---

## 5. Set a Primary Name (Reverse Resolution)

Setting a Primary Name maps your wallet back to your ENS name so dapps display `yourname.eth` instead of `0x...`.

Steps

- In [ENS App](https://app.ens.domains), open “My Account” → “Primary Name (reverse record)”
- Select your ENS name from the dropdown and confirm the transaction

---

<span id="6-set-your-ens-avatar"></span>

## 6. Set Your ENS Avatar

### 6.1. Set the avatar picture through the UI

![Set ENS avatar in the ENS profile UI](/assets/guides/ens-profile-set-avatar.jpg)
_Figure: Using the ENS App UI to set your avatar._

- Open your name in [ENS App](https://app.ens.domains)
- Go to your ENS name “Profile” and click on "Edit profile"
- Click on the camera icon and select your avatar from an NFT or uploading an image
- Confirm the first off-chain message and then sign the onchain transaction

![ENS avatar: off-chain signature then on-chain transaction](/assets/guides/offchain-onchain-signatures.jpg)
_Figure: First you sign an off‑chain message, then confirm the on‑chain records update._

### 6.2. Add/edit your text records

ENS stores avatars as a standard text record with key `avatar`. You can point it to an NFT, an IPFS file, or a standard HTTPS URL.

To set your text record, open your name in [ENS App](https://app.ens.domains):

“Records” → Edit Text Records” → Key: `avatar` → Value per method below → Save

Option A) NFT avatar (eip155 URI, verifiable on‑chain)

```text
avatar = eip155:1/erc721:CONTRACT_ADDRESS/TOKEN_ID
```

Option B) IPFS avatar (decentralized hosting)

```text
avatar = ipfs://<CID>
```

Option C) HTTPS avatar (simple, centralized)

```text
avatar = https://yourdomain.com/path/to/avatar.png
```

Notes

- NFT method allows dapps to cryptographically verify ownership
- IPFS is decentralized; pin your content to ensure persistence
- HTTPS is simplest, but centralized

---

## 7. Official ENS Guides

- [How to Register a .eth name](https://support.ens.domains/en/articles/7882582-how-to-register-a-eth-name)
- [How to Set an Avatar](https://support.ens.domains/en/articles/7883271-how-to-set-an-avatar)

---

## 8. Related guides

- [NFT Use Cases](/guides/nft-use-cases)
- [ERC721 vs. ERC1155](/guides/erc721-vs-erc1155)
- [Mastering ERC721](/guides/mastering-erc721)

- New to NFTs? Try the hands‑on challenges: [Simple NFT Example](/challenge/simple-nft-example) and [SVG NFT](/challenge/svg-nft)
