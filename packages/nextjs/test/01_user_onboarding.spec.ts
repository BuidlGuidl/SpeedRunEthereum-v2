import basicSetup from "./wallet-setup/basic.setup";
import { testWithSynpress } from "@synthetixio/synpress";
import { MetaMask, metaMaskFixtures } from "@synthetixio/synpress/playwright";

// Create a test instance with Synpress and MetaMask fixtures
const test = testWithSynpress(metaMaskFixtures(basicSetup));
const { expect } = test;

test.describe("User Onboarding Flow", () => {
  test("Should complete full user onboarding flow: connect wallet, register user, and verify address display", async ({
    context,
    page,
    metamaskPage,
    extensionId,
  }) => {
    const metamask = new MetaMask(context, metamaskPage, basicSetup.walletPassword, extensionId);
    const testAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const shortTestAddress = testAddress?.slice(0, 6) + "..." + testAddress?.slice(-4);

    // Navigate to the application
    await page.goto("/");

    // Step 1: Connect wallet
    await page.getByTestId("connect-button").click();
    await page.getByTestId("rk-wallet-option-io.metamask").waitFor({
      state: "visible",
      timeout: 30000,
    });
    await page.getByTestId("rk-wallet-option-io.metamask").click();
    await metamask.connectToDapp();

    // Step 2: Verify wallet connection and registration prompt
    await page.getByTestId("register-user-tooltip").waitFor({
      state: "visible",
      timeout: 30000,
    });
    await expect(page.getByTestId("register-user-tooltip")).toContainText(shortTestAddress);

    // Step 3: Register user
    await page.getByTestId("register-user-tooltip-button").click();
    await metamask.confirmSignature();

    // Step 4: Verify successful registration and address display
    await page.getByTestId("account-address-or-ens").waitFor({
      state: "visible",
      timeout: 30000,
    });
    await expect(page.getByTestId("account-address-or-ens")).toHaveText(shortTestAddress);
  });
});
