"use client";
import { useState, ReactNode } from "react";

interface SectionCardProps {
  title: string;
  icon?: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

/** Collapsible card used to wrap each estimator section */
export default function SectionCard({ title, icon, children, defaultOpen = true }: SectionCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden mb-5">
      {/* Header — click to toggle */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 bg-navy text-white hover:bg-navy-dark transition-colors"
      >
        <span className="flex items-center gap-2 font-semibold text-base tracking-wide">
          {icon && <span className="text-gold text-lg">{icon}</span>}
          {title}
        </span>
        <span className="text-gold text-xl font-bold">{open ? "−" : "+"}</span>
      </button>

      {/* Body */}
      {open && <div className="px-6 py-5">{children}</div>}
    </div>
  );
}
