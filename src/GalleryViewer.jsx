import { Component, useEffect, useLayoutEffect, useRef, useState } from "react";
import { claimGallery, ownsGallery } from "./gallerySession.js";
import galleryChunkUrl from "virtual:gallery-chunk-url";

let requestSequence = 0;
let loadedViewer;

class ViewerBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export default function GalleryViewer({ onClose, ...props }) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({ Viewer: null, failed: false });
  const intent = useRef(0);
  const owner = useRef({});
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const { Viewer, failed } = result;

  useLayoutEffect(() => {
    owner.current.cancel = () => {
      intent.current += 1;
      onCloseRef.current({ restoreFocus: false });
    };
    return claimGallery(owner.current);
  }, []);

  const close = () => {
    if (!ownsGallery(owner.current)) return;
    // Invalidate immediately, before a pending download can resolve or React unmounts.
    intent.current += 1;
    onClose();
  };

  useEffect(() => {
    const currentIntent = ++intent.current;
    const url = `${galleryChunkUrl}?galleryRequest=${++requestSequence}`;
    (loadedViewer ? Promise.resolve(loadedViewer) : import(/* @vite-ignore */ url))
      .then((module) => {
        loadedViewer = module;
        if (ownsGallery(owner.current) && intent.current === currentIntent) setResult({ Viewer: module.default, failed: false });
      })
      .catch(() => {
        if (ownsGallery(owner.current) && intent.current === currentIntent) setResult({ Viewer: null, failed: true });
      });
    return () => { intent.current += 1; };
  }, [attempt]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape" && ownsGallery(owner.current)) {
        intent.current += 1;
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const retry = () => {
    intent.current += 1;
    setResult({ Viewer: null, failed: false });
    setAttempt((value) => value + 1);
  };
  const fallback = (error) => <GalleryLoadState error={error} onRetry={retry} onClose={close} />;

  return Viewer ? (
    <ViewerBoundary key={attempt} fallback={fallback(true)}>
      <Viewer {...props} onClose={close} />
    </ViewerBoundary>
  ) : fallback(failed);
}

function GalleryLoadState({ error, onRetry, onClose }) {
  const cancelRef = useRef(null);
  useEffect(() => {
    cancelRef.current?.focus();
    cancelRef.current?.scrollIntoView({ block: "center", behavior: "instant" });
  }, [error]);
  return (
    <div className="note-panel gallery-load-state">
      <p role={error ? "alert" : "status"}>{error ? "We couldn’t open the photo gallery. Please try again." : "Opening photo gallery…"}</p>
      <div className="actions">
        {error && <button type="button" className="button primary" onClick={onRetry}>Retry gallery</button>}
        <button ref={cancelRef} type="button" className="button secondary" onClick={onClose}>Cancel gallery</button>
      </div>
    </div>
  );
}
