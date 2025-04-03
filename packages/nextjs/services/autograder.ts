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

  const data = await response.json();

  if (!response.ok) {
    return {
      success: false,
      feedback: data.error || `Autograder error: ${response.status} ${response.statusText}`,
    };
  }

  return data;
}
