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
