"use client";

import { useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";

// Store the original UTM parameters in local storage to track the source of the user
const UTMTracker = () => {
  const [storedUtmParams, setStoredUtmParams] = useLocalStorage<string | null>("originalUtmParams", null);

  useEffect(() => {
    // Skip if already stored
    if (storedUtmParams) return;

    const urlParams = new URLSearchParams(window.location.search);
    const utmParams: Record<string, string> = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach(key => {
      const value = urlParams.get(key);
      if (value) utmParams[key] = value;
    });
    if (Object.keys(utmParams).length > 0) {
      setStoredUtmParams(JSON.stringify(utmParams));
    }
  }, [storedUtmParams, setStoredUtmParams]);

  return null;
};

export default UTMTracker;
