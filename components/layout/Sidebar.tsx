"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useSidebar } from "./SidebarContext";

const NAV_ITEMS = [
  { href: "/producao", label: "Produção" },
  { href: "/cartao-ponto", label: "Cartão de Ponto" },
  { href: "/relatorios", label: "Relatórios" },
  { href: "/configuracoes", label: "Configurações" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { open } = useSidebar();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-border bg-surface p-5 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="mb-8 flex items-center justify-center">
        <Image
          src="/img/TENDENCIA_COM_NOME_ABAIXO-removebg-preview.png"
          alt="TendUP"
          width={500}
          height={500}
          priority
          className="h-auto w-32"
        />
      </div>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "text-accent" : "text-muted hover:bg-slate-50 hover:text-text"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg bg-accent-soft"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
