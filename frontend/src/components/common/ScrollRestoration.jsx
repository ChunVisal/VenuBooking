import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const scrollPositions = new Map();

export const useScrollRestoration = (key) => {
  const location = useLocation();
  const scrollRef = useRef(null);

  // Save scroll position before leaving
  useEffect(() => {
    const saveScrollPosition = () => {
      if (scrollRef.current) {
        scrollPositions.set(
          key || location.pathname,
          scrollRef.current.scrollTop,
        );
      } else {
        scrollPositions.set(key || location.pathname, window.scrollY);
      }
    };

    window.addEventListener("beforeunload", saveScrollPosition);
    return () => window.removeEventListener("beforeunload", saveScrollPosition);
  }, [key, location.pathname]);

  // Restore scroll position when coming back
  useEffect(() => {
    const savedPosition = scrollPositions.get(key || location.pathname);
    if (savedPosition) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            top: savedPosition,
            behavior: "instant",
          });
        } else {
          window.scrollTo({ top: savedPosition, behavior: "instant" });
        }
      }, 100);
    }
  }, [key, location.pathname]);

  return scrollRef;
};
