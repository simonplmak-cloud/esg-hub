"use client";

import { useEffect } from "react";

export default function ClientRedirect() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname === "esg.video" || hostname === "www.esg.video" || hostname.endsWith(".esg.video")) {
        window.location.href = "/videos";
      }
    }
  }, []);
  return null;
}
