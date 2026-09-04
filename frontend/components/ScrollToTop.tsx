"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function ScrollToTop() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Reset window and document scroll position to top on route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });

    if (typeof document !== "undefined") {
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
      }
    }
  }, [pathname, searchParams]);

  return null;
}
