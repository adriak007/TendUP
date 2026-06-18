"use client";

import type { ReactNode } from "react";

interface ModalProps {
  onClose: () => void;
  title: string;
  children: ReactNode;
  small?: boolean;
}

export function Modal({ onClose, title, children, small = true }: ModalProps) {
  return (
    <div
      className="overlay open"
      aria-hidden="false"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`overlay-content${small ? " modal-sm" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="overlay-header">
          <div className="overlay-title">{title}</div>
        </div>
        {children}
      </div>
    </div>
  );
}
