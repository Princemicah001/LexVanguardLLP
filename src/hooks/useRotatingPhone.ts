import { useState, useEffect } from "react";

export const FIRM_PHONE_NUMBERS = [
  "+254 116 171 396",
  "+254 708 948 809",
  "+254 707 865 597"
];

export function useRotatingPhone(intervalMs: number = 10000) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % FIRM_PHONE_NUMBERS.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs]);

  return {
    phone: FIRM_PHONE_NUMBERS[index],
    index,
    telHref: `tel:${FIRM_PHONE_NUMBERS[index].replace(/\s+/g, "")}`,
    allPhones: FIRM_PHONE_NUMBERS
  };
}
