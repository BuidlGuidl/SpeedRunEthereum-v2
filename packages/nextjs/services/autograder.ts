export type AutogradingResult = {
  success: boolean;
  feedback: string;
};

export async function submitToAutograder({
  challengeId,
  contractUrl,
}: {
  challengeId: number;
  contractUrl: string;
}): Promise<AutogradingResult> {
  const contractUrlObject = new URL(contractUrl);
  const blockExplorer = contractUrlObject.host;
  const address = contractUrlObject.pathname.replace("/address/", "");

  const response = await fetch(`${process.env.AUTOGRADING_SERVER}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ challenge: challengeId, address, blockExplorer }),
  });

  if (!response.ok) {
    throw new Error(`Failed to submit to autograder: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
