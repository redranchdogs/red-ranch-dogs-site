import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

// Native details owns disclosure semantics; animation never owns its final state.
export default function FAQItem({ question, answer, initiallyOpen = false }) {
  const [open, setOpen] = useState(initiallyOpen);
  const detailsRef = useRef(null);
  const animationRef = useRef(null);
  const previousHeight = useRef(null);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cancel = () => animationRef.current?.cancel();
    preference.addEventListener("change", cancel);
    return () => {
      cancel();
      preference.removeEventListener("change", cancel);
    };
  }, []);

  useLayoutEffect(() => {
    const details = detailsRef.current;
    animationRef.current?.cancel();
    if (previousHeight.current === null) return;
    const from = previousHeight.current;
    previousHeight.current = null;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !details.animate) return;
    animationRef.current = details.animate(
      [{ height: `${from}px`, overflow: "hidden" }, { height: `${details.getBoundingClientRect().height}px`, overflow: "hidden" }],
      { duration: 180, easing: "ease-out" }
    );
  }, [open]);

  return (
    <details className="faq-item" ref={detailsRef} open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary onClick={(event) => {
        event.preventDefault();
        previousHeight.current = detailsRef.current.getBoundingClientRect().height;
        setOpen((current) => !current);
      }}>
        <span>{question}</span><ChevronDown size={18} aria-hidden="true" />
      </summary>
      <p>{answer}</p>
    </details>
  );
}
