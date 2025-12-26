import React, { useState, useEffect, useRef } from "react";

interface TypewriterProps {
  text: string;
  speed?: number; // ms per char
  className?: string;
  cursorClassName?: string;
}

export const Typewriter: React.FC<TypewriterProps> = ({
  text,
  speed = 10,
  className = "",
  cursorClassName = "bg-blue-500",
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const index = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    // If text shrunk (reset), reset index
    if (text.length < index.current) {
      index.current = 0;
      setDisplayedText("");
    }
  }, [text]);

  useEffect(() => {
    const animate = (time: number) => {
      if (index.current < text.length) {
        if (time - lastUpdateRef.current > speed) {
          // Type one character
          setDisplayedText((prev) => text.slice(0, index.current + 1));
          index.current++;
          lastUpdateRef.current = time;
        }
        rafRef.current = requestAnimationFrame(animate);
      } else {
         // Ensure exact match at the end
         if (displayedText !== text) {
             setDisplayedText(text);
         }
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [text, speed, displayedText]);

  const isComplete = displayedText.length === text.length;

  return (
    <span className={className}>
      {displayedText}
      {!isComplete && (
        <span
          className={`inline-block w-1.5 h-4 align-middle ml-0.5 opacity-70 animate-pulse ${cursorClassName}`}
        />
      )}
    </span>
  );
};
