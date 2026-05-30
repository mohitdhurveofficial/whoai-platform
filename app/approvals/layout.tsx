import React from "react";

export default function ApprovalsLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen bg-[#f8f5ef]">
			<main className="p-6 md:p-10 max-w-[1440px] mx-auto">{children}</main>
		</div>
	);
}
