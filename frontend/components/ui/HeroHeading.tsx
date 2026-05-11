"use client";

import { useEffect, useState } from "react";

const words = ["cars", "watches", "clothes", "art", "electronics", "jewellery", "comics", "furniture"];

export default function HeroHeading() {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[index];

    if (!deleting) {
      if (displayed.length < word.length) {
        const timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 80);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => setDeleting(true), 1800);
        return () => clearTimeout(timeout);
      }
    } else {
      if (displayed.length > 0) {
        const timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 50);
        return () => clearTimeout(timeout);
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDeleting(false);
        setIndex((prev) => (prev + 1) % words.length);
      }
    }
  }, [displayed, deleting, index]);

  return (
    <h1 className="font-[family-name:var(--font-dm-serif)] text-4xl font-normal leading-tight tracking-tight text-text-heading sm:text-5xl">
      Bid on{" "}
      <span className="italic text-accent">
        {displayed}
      </span>
    </h1>
  );
}
