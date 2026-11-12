"use client";

import React, { useState, useEffect, useRef } from "react";

interface EditableTextProps {
  value: string;
  placeholder?: string;
  onChange: (val: string) => void;
  className?: string;
  multiline?: boolean;
  style?: React.CSSProperties;
}

export function EditableText({
  value,
  placeholder = "Nhấp để nhập...",
  onChange,
  className = "",
  multiline = false,
  style,
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (currentValue !== value) {
      onChange(currentValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!multiline && e.key === "Enter") {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === "Escape") {
      setCurrentValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`w-full bg-blue-50/70 border border-blue-400 rounded-sm p-1 outline-hidden resize-none ${className}`}
          style={style}
          rows={3}
        />
      );
    }
    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`w-full bg-blue-50/70 border border-blue-400 rounded-sm px-1 py-0.5 outline-hidden ${className}`}
        style={style}
      />
    );
  }

  const isEmpty = !value || value.trim() === "";

  return (
    <span
      onClick={() => setIsEditing(true)}
      title="Nhấp để sửa trực tiếp"
      className={`cursor-pointer hover:bg-blue-50/60 hover:outline hover:outline-1 hover:outline-blue-300 rounded px-0.5 transition-colors inline-block ${
        isEmpty ? "text-slate-400 italic" : ""
      } ${className}`}
      style={style}
    >
      {isEmpty ? placeholder : value}
    </span>
  );
}
