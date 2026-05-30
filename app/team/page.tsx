"use client";

import { useState } from "react";
import AppShell from "@/app/components/AppShell";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { StatusBadge } from "@/app/components/ui/StatusBadge";
import { Plus } from "lucide-react";

const team = [
  {
    id: "user-1",
    name: "Sarah Anderson",
    email: "sarah@acme.com",
    role: "Owner",
    status: "active",
    joinedAt: "Jan 15, 2026",
  },
  {
    id: "user-2",
    name: "Michael Chen",
    email: "michael@acme.com",
    role: "Admin",
    status: "active",
    joinedAt: "Feb 3, 2026",
  },
  {
    id: "user-3",
    name: "Emma Rodriguez",
    email: "emma@acme.com",
    role: "Reviewer",
    status: "active",
    joinedAt: "Feb 10, 2026",
  },
  {
    id: "user-4",
    name: "James Wilson",
    email: "james@acme.com",
    role: "Analyst",
    status: "active",
    joinedAt: "Mar 1, 2026",
  },
];

const roleDescriptions: { [key: string]: string } = {
  Owner: "Full access and organization management",
  Admin: "All permissions except organization management",
  Reviewer: "Can approve decisions and review policies",
  Analyst: "Read-only access to all data",
  Viewer: "Limited read access",
};

export default function TeamPage() {
  const [selectedUser, setSelectedUser] = useState(team[0]);

  return (
    <AppShell
      title="Team management"
      description="Manage user access, roles, permissions, and team collaboration across your organization."
    >
      <PageHeader
        title="Team"
        description="Invite, manage, and control team member access to your WhoAI workspace."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Team members</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">Active users</h2>
            </div>
            <button className="flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 transition">
              <Plus className="h-4 w-4" />
              Invite user
            </button>
          </div>

          <div className="space-y-3">
            {team.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`w-full rounded-3xl border p-4 text-left transition ${
                  user.id === selectedUser.id
                    ? "border-sky-500 bg-sky-50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{user.name}</p>
                    <p className="text-sm text-slate-600">{user.email}</p>
                    <p className="mt-2 text-xs font-medium text-slate-500">{user.role}</p>
                  </div>
                  <StatusBadge label="Active" variant="approved" />
                </div>
              </button>
            ))}
          </div>
        </div>

        <aside className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">User details</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">{selectedUser.name}</h2>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-slate-950">Email</p>
              <p className="mt-2 text-sm text-slate-600">{selectedUser.email}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-950">Role</p>
              <div className="mt-2">
                <StatusBadge label={selectedUser.role} variant="approved" />
              </div>
              <p className="mt-2 text-sm text-slate-600">{roleDescriptions[selectedUser.role]}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-950">Joined</p>
              <p className="mt-2 text-sm text-slate-600">{selectedUser.joinedAt}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-950">Status</p>
              <div className="mt-2">
                <StatusBadge label="Active" variant="approved" />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <button className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
                Change role
              </button>
              <button className="w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition">
                Remove from team
              </button>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
