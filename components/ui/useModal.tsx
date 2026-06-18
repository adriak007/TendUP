"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Modal } from "./Modal";

interface AlertOptions {
  title?: string;
  primaryText?: string;
}
interface ConfirmOptions {
  title?: string;
  confirmText?: string;
  cancelText?: string;
}
interface PromptOptions {
  title?: string;
  label?: string;
  initial?: string;
}

interface ModalContextValue {
  alert: (message: string, options?: AlertOptions) => Promise<void>;
  confirm: (message: string, options?: ConfirmOptions) => Promise<boolean>;
  prompt: (options?: PromptOptions) => Promise<string | null>;
}

type ActiveModal =
  | { kind: "alert"; message: string; title: string; primaryText: string; resolve: () => void }
  | {
      kind: "confirm";
      message: string;
      title: string;
      confirmText: string;
      cancelText: string;
      resolve: (value: boolean) => void;
    }
  | { kind: "prompt"; title: string; label: string; resolve: (value: string | null) => void };

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ActiveModal | null>(null);
  const [promptValue, setPromptValue] = useState("");

  const alert = useCallback((message: string, options: AlertOptions = {}) => {
    return new Promise<void>((resolve) => {
      setActive({
        kind: "alert",
        message,
        title: options.title ?? "Aviso",
        primaryText: options.primaryText ?? "OK",
        resolve,
      });
    });
  }, []);

  const confirm = useCallback((message: string, options: ConfirmOptions = {}) => {
    return new Promise<boolean>((resolve) => {
      setActive({
        kind: "confirm",
        message,
        title: options.title ?? "Confirmar",
        confirmText: options.confirmText ?? "Confirmar",
        cancelText: options.cancelText ?? "Cancelar",
        resolve,
      });
    });
  }, []);

  const prompt = useCallback((options: PromptOptions = {}) => {
    return new Promise<string | null>((resolve) => {
      setPromptValue(options.initial ?? "");
      setActive({
        kind: "prompt",
        title: options.title ?? "Entrada",
        label: options.label ?? "Valor",
        resolve,
      });
    });
  }, []);

  function close() {
    setActive(null);
  }

  return (
    <ModalContext.Provider value={{ alert, confirm, prompt }}>
      {children}

      {active?.kind === "alert" && (
        <Modal
          title={active.title}
          onClose={() => {
            active.resolve();
            close();
          }}
        >
          <div className="overlay-body" style={{ padding: 16 }}>
            {active.message}
          </div>
          <div style={{ padding: "0 16px 16px", display: "flex", justifyContent: "flex-end" }}>
            <button
              className="btn-primary"
              onClick={() => {
                active.resolve();
                close();
              }}
            >
              {active.primaryText}
            </button>
          </div>
        </Modal>
      )}

      {active?.kind === "confirm" && (
        <Modal
          title={active.title}
          onClose={() => {
            active.resolve(false);
            close();
          }}
        >
          <div className="overlay-body" style={{ padding: 16 }}>
            {active.message}
          </div>
          <div style={{ padding: "0 16px 16px", display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              className="btn-secondary"
              onClick={() => {
                active.resolve(false);
                close();
              }}
            >
              {active.cancelText}
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                active.resolve(true);
                close();
              }}
            >
              {active.confirmText}
            </button>
          </div>
        </Modal>
      )}

      {active?.kind === "prompt" && (
        <Modal
          title={active.title}
          onClose={() => {
            active.resolve(null);
            close();
          }}
        >
          <div className="overlay-body" style={{ padding: 16, display: "grid", gap: 8 }}>
            <label>{active.label}</label>
            <input
              type="text"
              autoFocus
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  active.resolve(promptValue);
                  close();
                }
                if (e.key === "Escape") {
                  active.resolve(null);
                  close();
                }
              }}
            />
          </div>
          <div style={{ padding: "0 16px 16px", display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              className="btn-secondary"
              onClick={() => {
                active.resolve(null);
                close();
              }}
            >
              Cancelar
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                active.resolve(promptValue);
                close();
              }}
            >
              Salvar
            </button>
          </div>
        </Modal>
      )}
    </ModalContext.Provider>
  );
}

export function useModal(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal deve ser usado dentro de <ModalProvider>");
  return ctx;
}
