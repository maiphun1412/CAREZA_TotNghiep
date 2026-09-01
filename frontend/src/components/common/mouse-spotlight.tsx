"use client";

import React, { useState, useRef, useEffect } from "react";

interface MouseSpotlightProps {
  color?: string;
  size?: number;
  className?: string;
}

export default function MouseSpotlight({
  color = "rgba(15, 82, 186, 0.06), rgba(22, 140, 195, 0.04)",
  size = 700,
  className = "",
}: MouseSpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    // Kiểm tra prefers-reduced-motion để tôn trọng tùy chọn người dùng
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setShouldReduceMotion(mediaQuery.matches);
    const handleChange = () => setShouldReduceMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || shouldReduceMotion) return;
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    const parent = containerRef.current?.parentElement;
    if (parent) {
      parent.addEventListener("mousemove", handleMouseMove);
      parent.addEventListener("mouseenter", handleMouseEnter);
      parent.addEventListener("mouseleave", handleMouseLeave);
      
      // Đặt position relative cho parent nếu là static để spotlight hoạt động đúng tọa độ absolute
      const parentStyle = window.getComputedStyle(parent);
      if (parentStyle.position === "static") {
        parent.style.position = "relative";
      }
    }

    return () => {
      if (parent) {
        parent.removeEventListener("mousemove", handleMouseMove);
        parent.removeEventListener("mouseenter", handleMouseEnter);
        parent.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [shouldReduceMotion]);

  if (shouldReduceMotion) return null;

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none hidden lg:block transition-opacity duration-300 ${
        isHovered ? "opacity-100" : "opacity-0"
      } ${className}`}
      style={{
        background: `radial-gradient(${size}px circle at ${coords.x}px ${coords.y}px, ${color}, transparent 75%)`,
      }}
    />
  );
}
