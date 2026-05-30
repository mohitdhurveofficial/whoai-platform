"use client";
import React from "react";

type Props = {
  placeholder?: string;
  onChange?: (value: string) => void;
};

export function SearchBar({ placeholder = "Search...", onChange }: Props) {
  return (
    <input
      type="search"
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
      className="rounded-md p-2 border w-full"
    />
  );
}
