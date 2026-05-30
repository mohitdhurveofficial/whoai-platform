"use client";
import React from "react";

type Props = {
  isOpen?: boolean;
  onClose?: () => void;
  title?: string;
  children?: React.ReactNode;
};

export function SlideOver({ isOpen, onClose, title, children }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1" onClick={onClose} />
      <div className="w-1/3 bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} className="text-sm text-slate-500">Close</button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
