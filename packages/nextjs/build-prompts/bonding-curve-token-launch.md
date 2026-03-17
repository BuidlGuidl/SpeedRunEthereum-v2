---
name: "Bonding Curve Token Launch"
description: "pump.fun-style launchpad where anyone can create a token with an automated bonding curve. Price rises with every buy."
imageUrl: "/assets/challenges/tokenVendor.svg"
---

# SPEC: Bonding Curve Token Launch

## 1. Objective
A token launchpad where anyone can create a new ERC-20 token with an automated bonding curve. The price rises mathematically with each purchase and decreases with each sale (no external liquidity pool or market maker needed). A small creator fee rewards token creators on every trade.

## 2. Pre-flight & Context
- **Framework:** Scaffold-ETH 2.
- **Check:** Verify if ./packages/nextjs/scaffold.config.ts exists directly in the current working directory (do not search subdirectories). If it doesn't exist, this is not a Scaffold-ETH 2 project. Follow the instructions at https://docs.scaffoldeth.io/SKILL.md to scaffold it first. If it exists, continue directly with building.

## 3. Builder Customizations (Tweak before prompting)
- `CURVE_TYPE`: Linear (`price = BASE_PRICE + slope * supply`)
- `BASE_PRICE_WEI`: 100000000000000 (0.0001 ETH)
- `SLOPE`: Adjust to control how aggressively price increases.
- `CREATOR_FEE_BPS`: 100 (1% of each trade goes to the token creator)
- `UI_THEME`: Vibrant trading terminal with live price charts and activity feed.

## 4. Smart Contract Spec
- **Architecture:** A `TokenFactory` contract that deploys new `BondingCurveToken` instances. Each `BondingCurveToken` is both an ERC-20 and its own market maker: ETH sent to it mints new tokens; tokens sold back burn them and return ETH.
- **TokenFactory Functions:**
  - `createToken(name, symbol)`: deploys a new BondingCurveToken, stores the creator address, and registers it in an on-chain array.
  - `getTokens()` view: returns all deployed token addresses.
- **BondingCurveToken Functions:**
  - `buy()` payable: calculate how many tokens the sent ETH buys at the current curve price (minus creator fee), mint them to the buyer.
  - `sell(amount)`: burn the tokens, skim the creator fee, and send back the remaining ETH value according to the current curve price.
  - `getCurrentPrice()` view: returns the current price per token based on total supply.
  - `getEstimatedBuy(ethAmount)` view: preview how many tokens an ETH amount would buy.
  - `getEstimatedSell(tokenAmount)` view: preview how much ETH selling would return.
- **Events:** Emit `TokenCreated`, `Trade(buyer, isBuy, ethAmount, tokenAmount, newPrice)` events. These power the frontend activity feed.
- **Agent Autonomy:** Use integral math (area under the curve) for accurate buy/sell calculations instead of a flat spot price, so large orders are priced fairly across the curve. When solving the quadratic equation for buy amount, the discriminant (BASE_PRICE² + 2 * SLOPE * totalIntegral) must NOT be divided by any scaling factor before taking the square root. Premature division destroys precision because the two terms can differ by many orders of magnitude. Verify that buying 1 ETH of tokens at initial supply returns a non-trivial token amount (not zero or dust). Ensure the contract always holds exactly enough ETH to buy back all outstanding tokens (creator fees must come from the trader's side, not the reserve).

## 5. Frontend Spec
- **Required Views:**
  - **Explore page**: grid/list of all launched tokens showing name, symbol, current price, market cap, and creator. Sortable by newest and market cap.
  - **Create Token page**: simple form (name, symbol) to deploy a new token.
  - **Token Detail / Trade page**: the main trading view for a single token:
    - A live price chart plotting price vs. supply (rendered with Canvas or SVG, NOT an external charting library).
    - Buy and sell interfaces with real-time price impact preview.
    - Token stats (current price, total supply, market cap, contract ETH balance, creator fee earned).
    - Live trade activity feed showing recent buys/sells (read from contract events).
- **Agent Autonomy:** Build the `UI_THEME`. The price chart is the hero element: plot the bonding curve visually and show a marker for the current position on it. When the user types a buy/sell amount, dynamically highlight the area on the curve that their trade would traverse. The activity feed should auto-update and make the page feel alive.

## 6. Next Iterations (Builder: ask the agent to add these later)
- [ ] Token image/description metadata (stored on-chain or IPFS).
- [ ] Graduation mechanic: auto-deploy to Uniswap when market cap hits a threshold (pump.fun style).
- [ ] Quadratic or sigmoid curve options for different price dynamics.
- [ ] Comment / chat thread per token.
- [ ] Leaderboard of top tokens by volume or market cap.
