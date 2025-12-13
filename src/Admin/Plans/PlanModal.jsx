import { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function PlanModal({ open, title, onClose, children }) {
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]); // latest handler

  useLayoutEffect(() => {
    if (!open) return;

    // Ensure the portal node is mounted
    const dialog = dialogRef.current;
    if (!dialog) return; // guard against null to avoid querySelectorAll crash

    const focusables = dialog.querySelectorAll(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );

    // Prefer the first form control, not the header close button
    const closeBtn = dialog.querySelector('button[aria-label="Close dialog"]');
    const first = Array.from(focusables).find(el => el !== closeBtn) || focusables[0];
    const last = focusables[focusables.length - 1];

    first?.focus();

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current?.();
      }
      if (e.key === "Tab" && focusables.length) {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first?.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const { body } = document;
    const prevOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
      }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCloseRef.current?.(); }}
      aria-hidden={false}
    >
      <div
        ref={dialogRef}
        style={{
          background: "#fff", borderRadius: 12, width: "min(640px, 92vw)",
          maxHeight: "80vh", overflow: "auto", boxShadow: "0 10px 30px rgba(0,0,0,.25)", padding: 20
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="plan-modal-title"
        aria-describedby="plan-modal-desc"
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <h3 id="plan-modal-title" style={{ margin: 0 }}>{title || "Add Plan"}</h3>
          <button style={{border:"none", background:"none"}} onClick={() => onCloseRef.current?.()} aria-label="Close dialog">✕</button>
        </div>
        <div id="plan-modal-desc" style={{ marginTop: 6, marginBottom: 12 }}>
          Fill in the plan details below.
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
