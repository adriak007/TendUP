"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarContext";

const NAV_ITEMS = [
  { href: "/producao", label: "Produção" },
  { href: "/relatorios", label: "Relatórios" },
  { href: "/configuracoes", label: "Configurações" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { open } = useSidebar();

  return (
    <aside className={`sidebar${open ? " open" : ""}`}>
      <div className="brand">
        <Image
          src="/img/TENDENCIA_COM_NOME_ABAIXO-removebg-preview.png"
          alt="TendUP"
          width={500}
          height={500}
          priority
        />
      </div>
      <nav className="nav">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item${pathname === item.href ? " active" : ""}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
