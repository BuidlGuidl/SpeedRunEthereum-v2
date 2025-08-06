"use client";

import { useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";

// Store the original referer and UTM parameters in local storage to track the source of the user for improved conversion tracking
const AcquisitionTracker = () => {
  const [storedReferrer, setStoredReferrer] = useLocalStorage<string | null>("originalReferrer", null);
  const [storedUtmParams, setStoredUtmParams] = useLocalStorage<string | null>("originalUtmParams", null);

  useEffect(() => {
    if (!storedReferrer) {
      const referrer = document.referrer;
      const currentDomain = window.location.hostname;
      if (referrer && !referrer.includes(currentDomain)) {
        setStoredReferrer(referrer);
      }
    }

    if (!storedUtmParams) {
      const urlParams = new URLSearchParams(window.location.search);
      const utmParams: Record<string, string> = {};
      ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach(key => {
        const value = urlParams.get(key);
        if (value) utmParams[key] = value;
      });
      if (Object.keys(utmParams).length > 0) {
        setStoredUtmParams(JSON.stringify(utmParams));
      }
    }
  }, [storedReferrer, setStoredReferrer, storedUtmParams, setStoredUtmParams]);

  return null;
};

export default AcquisitionTracker;
