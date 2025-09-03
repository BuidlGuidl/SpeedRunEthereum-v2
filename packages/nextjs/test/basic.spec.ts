import basicSetup from "./wallet-setup/basic.setup";
import { testWithSynpress } from "@synthetixio/synpress";
import { MetaMask, metaMaskFixtures } from "@synthetixio/synpress/playwright";

// Create a test instance with Synpress and MetaMask fixtures
const test = testWithSynpress(metaMaskFixtures(basicSetup));
const { expect } = test;

test("Should register user on SRE and verify the short address", async ({
  context,
  page,
  metamaskPage,
  extensionId,
}) => {
  const metamask = new MetaMask(context, metamaskPage, basicSetup.walletPassword, extensionId);

  await page.goto("/");

  await page.getByTestId("connect-button").click();

  await page.getByTestId("rk-wallet-option-io.metamask").waitFor({
    state: "visible",
    timeout: 30000,
  });

  await page.getByTestId("rk-wallet-option-io.metamask").click();

  await metamask.connectToDapp();

  await page.getByTestId("register-user-tooltip").waitFor({
    state: "visible",
    timeout: 30000,
  });

  const testAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  const shortTestAddress = testAddress?.slice(0, 6) + "..." + testAddress?.slice(-4);

  await expect(page.getByTestId("register-user-tooltip")).toContainText(shortTestAddress);

  await page.getByTestId("register-user-tooltip-button").click();

  await metamask.confirmSignature();

  await page.getByTestId("account-address-or-ens").waitFor({
    state: "visible",
    timeout: 30000,
  });

  await expect(page.getByTestId("account-address-or-ens")).toHaveText(shortTestAddress);
});
