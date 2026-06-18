"use client";

import { AnimatePresence } from "framer-motion";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { inputClass } from "./styles";

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

      <AnimatePresence>
        {active?.kind === "alert" && (
          <Modal
            key="alert"
            title={active.title}
            onClose={() => {
              active.resolve();
              close();
            }}
          >
            <div className="px-5 py-4 text-sm text-text">{active.message}</div>
            <div className="flex justify-end gap-2 px-5 pb-4">
              <Button
                variant="primary"
                onClick={() => {
                  active.resolve();
                  close();
                }}
              >
                {active.primaryText}
              </Button>
            </div>
          </Modal>
        )}

        {active?.kind === "confirm" && (
          <Modal
            key="confirm"
            title={active.title}
            onClose={() => {
              active.resolve(false);
              close();
            }}
          >
            <div className="px-5 py-4 text-sm text-text">{active.message}</div>
            <div className="flex justify-end gap-2 px-5 pb-4">
              <Button
                variant="secondary"
                onClick={() => {
                  active.resolve(false);
                  close();
                }}
              >
                {active.cancelText}
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  active.resolve(true);
                  close();
                }}
              >
                {active.confirmText}
              </Button>
            </div>
          </Modal>
        )}

        {active?.kind === "prompt" && (
          <Modal
            key="prompt"
            title={active.title}
            onClose={() => {
              active.resolve(null);
              close();
            }}
          >
            <div className="grid gap-2 px-5 py-4">
              <label className="text-sm font-medium text-muted">{active.label}</label>
              <input
                type="text"
                autoFocus
                className={inputClass}
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
            <div className="flex justify-end gap-2 px-5 pb-4">
              <Button
                variant="secondary"
                onClick={() => {
                  active.resolve(null);
                  close();
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  active.resolve(promptValue);
                  close();
                }}
              >
                Salvar
              </Button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  );
}

export function useModal(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal deve ser usado dentro de <ModalProvider>");
  return ctx;
}
