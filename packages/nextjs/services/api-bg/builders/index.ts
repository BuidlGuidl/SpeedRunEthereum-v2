import { UserByAddress } from "~~/services/database/repositories/users";
import { getUserSocials } from "~~/utils/socials";

async function fetchBgMember(address: string | undefined) {
  if (!address) return;

  const response = await fetch(`${process.env.NEXT_PUBLIC_BG_BACKEND}/builders/${address}`);
  if (response.status !== 200) {
    if (response.status === 404) {
      return;
    }
    throw new Error("Failed to fetch user");
  }

  const data = await response.json();
  return data;
}

export async function isBgMember(address: string | undefined) {
  try {
    const builder = await fetchBgMember(address);
    return Boolean(builder);
  } catch (error) {
    console.error(error);
    return false;
  }
}

// convert "socialSomething" key to "something" to match BG style
const convertSocialKeys = (key: string) => {
  if (key.startsWith("social")) {
    const socialKey = key.slice(6).toLowerCase();
    return socialKey === "x" ? "twitter" : socialKey;
  }
  return key;
};

export async function createBgMember(user: UserByAddress) {
  const socialLinks = Object.fromEntries(
    Object.entries(getUserSocials(user)).map(([key, value]) => [convertSocialKeys(key), value]),
  );

  const payload = {
    builderAddress: user.userAddress,
    existingBuilderData: {
      socialLinks,
    },
  };

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BG_BACKEND}/api/builders/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.BG_BACKEND_API_KEY || "",
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 400 || response.status === 401) {
      const data = await response.text();
      throw new Error(data);
    }

    if (response.status === 204) {
      console.log(`User ${user.userAddress} already existed on BGv3`);
    } else {
      console.log(`User ${user.userAddress} created on BGv3!`);
    }
  } catch (error) {
    console.error("BG user creation failed:", error);
    throw new Error(`BG user creation failed: ${error}`);
  }
}
