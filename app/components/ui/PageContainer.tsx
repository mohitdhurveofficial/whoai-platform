import React, { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Unified page container for consistent layout across all app pages.
 * Provides standardized max-width, responsive padding, and vertical spacing.
 * Used by all dashboard pages to ensure visual consistency.
 */
export function PageContainer({ children, className = "" }: PageContainerProps) {
  return (
    <div className={`mx-auto max-w-[1440px] px-4 py-6 sm:px-6 md:px-8 lg:px-10 ${className}`}>
      {children}
    </div>
  );
}
