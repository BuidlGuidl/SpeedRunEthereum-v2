"use client";

import { useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";

// Store the original referer in local storage to track the source of the user
const ReferrerTracker = () => {
  const [storedReferrer, setStoredReferrer] = useLocalStorage<string | null>("originalReferrer", null);

  useEffect(() => {
    // Skip if already stored
    if (storedReferrer) return;

    const referrer = document.referrer;
    const currentDomain = window.location.hostname;

    if (referrer && !referrer.includes(currentDomain)) {
      setStoredReferrer(referrer);
    }
  }, [storedReferrer, setStoredReferrer]);

  return null;
};

export default ReferrerTracker;
