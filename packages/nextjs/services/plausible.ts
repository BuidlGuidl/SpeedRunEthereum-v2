export enum PlausibleEvent {
  JOIN_BATCH = "joinBatch",
  SIGNUP_SRE = "signupSRE",
  CHALLENGE_SUBMISSION = "challengeSubmission",
}

const PLAUSIBLE_EVENT_ENDPOINT = "https://plausible.io/api/event";

export async function trackPlausibleEvent(
  eventName: PlausibleEvent,
  props?: Record<string, string | number | boolean | undefined>,
  request?: Request,
) {
  const payload = {
    domain: "speedrunethereum.com",
    name: eventName,
    url: `https://speedrunethereum.com`,
    props,
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (request) {
    headers["User-Agent"] = request.headers.get("user-agent") || "";
    headers["X-Forwarded-For"] = request.headers.get("x-forwarded-for") || "";
  }

  return fetch(PLAUSIBLE_EVENT_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  }).catch(error => {
    console.error("Error tracking Plausible event:", error);
    throw error;
  });
}
