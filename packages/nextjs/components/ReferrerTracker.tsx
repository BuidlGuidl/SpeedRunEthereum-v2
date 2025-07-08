"use client";

import { useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";

// Store the original referer in local storage to track the source of the user
const ReferrerTracker = () => {
  const [storedReferrer, setStoredReferrer] = useLocalStorage<string | null>("originalReferrer", null);

  useEffect(() => {
    // Skip if already stored
    if (storedReferrer) return;

    // Delete: this is for testing purposes only
    // e.g. http://localhost:3000/?mockReferrer=https://www.example.com
    const urlParams = new URLSearchParams(window.location.search);
    const mockReferrer = urlParams.get("mockReferrer");

    const referrer = mockReferrer || document.referrer;
    const currentDomain = window.location.hostname;

    if (referrer && !referrer.includes(currentDomain)) {
      setStoredReferrer(referrer);
    }
  }, [storedReferrer, setStoredReferrer]);

  return null;
};

export default ReferrerTracker;
