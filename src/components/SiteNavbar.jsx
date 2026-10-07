import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import ZetaMark from "@/components/ZetaMark";
import { cn } from "@/lib/utils";

export default function SiteNavbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const links = [
    { to: "/", label: "Home" },
    { to: "/prenota", label: "Prenota" },
    { to: "/#contatti", label: "Contatti" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <ZetaMark className="h-5 w-5" />
          </span>
          <span className="font-heading text-xl leading-none text-foreground">
            Ripetizioni<span className="text-primary">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "text-sm font-medium tracking-wide transition-colors hover:text-primary",
                location.pathname === l.to ? "text-primary" : "text-foreground/70"
              )}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/prenota"
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Prenota una lezione
          </Link>
        </nav>

        <button
          className="rounded-lg p-2 text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <div className="flex flex-col px-4 py-3">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="py-3 text-base font-medium text-foreground/80"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/prenota"
              className="mt-2 rounded-full bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground"
              onClick={() => setOpen(false)}
            >
              Prenota una lezione
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}