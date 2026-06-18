"use client";

import { useRef, useState, type DragEvent } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

interface UploadCardProps {
  onFile: (file: File) => void;
  loading: boolean;
  error: string | null;
}

export function UploadCard({ onFile, loading, error }: UploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-16 text-center transition-colors ${
        dragOver ? "border-accent bg-accent-soft" : "border-border bg-surface"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <span className="text-3xl">🧾</span>
      <p className="text-sm font-medium text-text">
        {loading ? "Lendo o cartão ponto..." : "Envie o PDF do cartão ponto"}
      </p>
      <p className="max-w-sm text-sm text-muted">
        Arraste o arquivo aqui ou clique no botão abaixo. Funciona com o relatório exportado do
        Control iD.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
        }}
      />
      <Button
        variant="primary"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
        className="mt-1"
      >
        {loading ? "Processando..." : "Selecionar PDF"}
      </Button>
      {error && <p className="text-sm text-danger">{error}</p>}
    </motion.div>
  );
}
