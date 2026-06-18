"use client";

import { useSidebar } from "./SidebarContext";

export function MobileSidebarBackdrop() {
  const { open, setOpen } = useSidebar();
  return (
    <div
      className={`sidebar-backdrop${open ? " open" : ""}`}
      aria-hidden={!open}
      onClick={() => setOpen(false)}
    />
  );
}
