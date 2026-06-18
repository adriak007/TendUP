"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useSidebar } from "./SidebarContext";

export function MobileSidebarBackdrop() {
  const { open, setOpen } = useSidebar();
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => setOpen(false)}
        />
      )}
    </AnimatePresence>
  );
}
