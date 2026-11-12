"use client";

import React from "react";
import { DecorationConfig } from "../../types";

interface DividerProps {
  decorations?: DecorationConfig;
  primaryColor: string;
  className?: string;
}

export function DecorativeDivider({ decorations, primaryColor, className = "" }: DividerProps) {
  const style = decorations?.dividerStyle || "solid";

  if (style === "none") return null;

  if (style === "dashed") {
    return <div className={`w-full border-b border-dashed my-2 ${className}`} style={{ borderColor: `${primaryColor}60` }} />;
  }
  if (style === "dotted") {
    return <div className={`w-full border-b-2 border-dotted my-2 ${className}`} style={{ borderColor: `${primaryColor}60` }} />;
  }
  if (style === "double") {
    return (
      <div className={`w-full my-2 space-y-0.5 ${className}`}>
        <div className="w-full border-b" style={{ borderColor: primaryColor }} />
        <div className="w-full border-b" style={{ borderColor: primaryColor }} />
      </div>
    );
  }
  if (style === "gradient") {
    return (
      <div
        className={`w-full h-0.5 my-2 rounded-full ${className}`}
        style={{
          background: `linear-gradient(90deg, ${primaryColor} 0%, ${primaryColor}10 100%)`,
        }}
      />
    );
  }

  // Solid default
  return <div className={`w-full border-b my-2 ${className}`} style={{ borderColor: `${primaryColor}40` }} />;
}

interface HeaderPatternProps {
  decorations?: DecorationConfig;
  primaryColor: string;
}

export function DecorativeHeaderPattern({ decorations, primaryColor }: HeaderPatternProps) {
  const pattern = decorations?.headerPattern || "accent-corner";

  if (pattern === "none") return null;

  if (pattern === "accent-corner") {
    return (
      <div
        className="absolute top-0 right-0 w-24 h-24 pointer-events-none select-none overflow-hidden opacity-40"
        aria-hidden="true"
      >
        <div
          className="absolute -top-12 -right-12 w-24 h-24 rounded-full"
          style={{ backgroundColor: primaryColor }}
        />
      </div>
    );
  }

  if (pattern === "top-banner") {
    return (
      <div
        className="absolute top-0 left-0 right-0 h-1.5 pointer-events-none select-none"
        style={{
          background: `linear-gradient(90deg, ${primaryColor} 0%, ${primaryColor}90 50%, ${primaryColor}20 100%)`,
        }}
        aria-hidden="true"
      />
    );
  }

  if (pattern === "dots") {
    return (
      <div
        className="absolute top-2 right-4 w-16 h-8 pointer-events-none select-none opacity-20 grid grid-cols-6 gap-1"
        aria-hidden="true"
      >
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: primaryColor }} />
        ))}
      </div>
    );
  }

  if (pattern === "geometric") {
    return (
      <div
        className="absolute top-0 right-0 w-20 h-20 pointer-events-none select-none opacity-30"
        aria-hidden="true"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          <polygon points="100,0 0,0 100,100" fill={primaryColor} opacity="0.15" />
          <polygon points="100,0 40,0 100,60" fill={primaryColor} opacity="0.3" />
        </svg>
      </div>
    );
  }

  return null;
}

interface CardProps {
  children: React.ReactNode;
  decorations?: DecorationConfig;
  primaryColor: string;
  className?: string;
}

export function DecorativeCard({ children, decorations, primaryColor, className = "" }: CardProps) {
  const cardBorder = decorations?.cardBorder || "subtle";

  let borderStyle = "border-slate-200 bg-white";
  if (cardBorder === "none") {
    borderStyle = "border-transparent bg-transparent";
  } else if (cardBorder === "accent") {
    return (
      <div
        className={`p-3 rounded-xl border bg-white shadow-2xs ${className}`}
        style={{ borderColor: `${primaryColor}40`, borderLeftWidth: "3px", borderLeftColor: primaryColor }}
      >
        {children}
      </div>
    );
  } else if (cardBorder === "bordered") {
    return (
      <div
        className={`p-3 rounded-xl border-2 bg-white shadow-2xs ${className}`}
        style={{ borderColor: `${primaryColor}30` }}
      >
        {children}
      </div>
    );
  }

  return <div className={`p-3 rounded-xl border ${borderStyle} shadow-2xs ${className}`}>{children}</div>;
}
