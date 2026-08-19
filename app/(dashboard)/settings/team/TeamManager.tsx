"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail, Trash2, UserPlus, X } from "lucide-react";
import { can, ROLES, ROLE_DESCRIPTIONS, outranks, type Role } from "@/lib/auth/roles";

type Member = {
  id: string;
  email: string;
  fullName: string | null;
  role: Role;
  createdAt: string;
  isYou: boolean;
};

type Invite = {
  id: string;
  email: string;
  role: Role;
  expiresAt: string;
  createdAt: string;
  expired: boolean;
};

/** Module-level so the mount effect body stays a plain promise chain. */
async function fetchTeam(): Promise<{ members: Member[]; invites: Invite[] }> {
  const [membersRes, invitesRes] = await Promise.all([
    fetch("/api/team/members"),
    fetch("/api/team/invites"),
  ]);
  if (!membersRes.ok) throw new Error("Failed to load members");
  return {
    members: await membersRes.json(),
    // A VIEWER can read the roster; if the invites call is ever restricted
    // further, an empty list is a better outcome than a broken page.
    invites: invitesRes.ok ? await invitesRes.json() : [],
  };
}

const inputClass =
  "rounded-md border border-[#EEE8E2] bg-white px-3 py-2 text-[14px] text-[#111111] placeholder:text-[#999999] focus-visible:border-[#FF6B00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]/30";

export default function TeamManager({ viewerRole, viewerId }: { viewerRole: Role; viewerId: string }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("DEVELOPER");
  const [inviting, setInviting] = useState(false);

  const mayInvite = can(viewerRole, "manageInvites");
  const mayChangeRoles = can(viewerRole, "manageMemberRoles");

  useEffect(() => {
    fetchTeam()
      .then(({ members, invites }) => {
        setMembers(members);
        setInvites(invites);
      })
      .catch(() => setNotice({ type: "error", text: "Could not load your team." }))
      .finally(() => setLoading(false));
  }, []);

  const reload = async () => {
    try {
      const { members, invites } = await fetchTeam();
      setMembers(members);
      setInvites(invites);
    } catch {
      setNotice({ type: "error", text: "Could not refresh your team." });
    }
  };

  const submitInvite = async (event: React.FormEvent) => {
    event.preventDefault();
    setInviting(true);
    setNotice(null);
    try {
      const res = await fetch("/api/team/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not send the invitation.");

      setInviteEmail("");
      setNotice({
        type: "success",
        text: data.emailSent
          ? `Invitation sent to ${data.invite.email}.`
          : `Invitation created for ${data.invite.email}, but the email could not be sent. Check RESEND_API_KEY.`,
      });
      await reload();
    } catch (error) {
      setNotice({
        type: "error",
        text: error instanceof Error ? error.message : "Could not send the invitation.",
      });
    } finally {
      setInviting(false);
    }
  };

  const changeRole = async (member: Member, role: Role) => {
    setBusyId(member.id);
    setNotice(null);
    try {
      const res = await fetch(`/api/team/members/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not update that member.");
      await reload();
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Update failed." });
    } finally {
      setBusyId(null);
    }
  };

  const removeMember = async (member: Member) => {
    if (!confirm(`Remove ${member.email} from this workspace?`)) return;
    setBusyId(member.id);
    setNotice(null);
    try {
      const res = await fetch(`/api/team/members/${member.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not remove that member.");
      setNotice({ type: "success", text: `${member.email} was removed.` });
      await reload();
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Removal failed." });
    } finally {
      setBusyId(null);
    }
  };

  const revokeInvite = async (invite: Invite) => {
    setBusyId(invite.id);
    setNotice(null);
    try {
      const res = await fetch(`/api/team/invites/${invite.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not revoke that invitation.");
      await reload();
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Revoke failed." });
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-10 text-[14px] text-[#666666]" role="status">
        <Loader2 className="h-4 w-4 animate-spin text-[#FF6B00]" />
        Loading your team…
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-[22px] font-bold tracking-tight text-[#111111]">Team</h1>
        <p className="mt-1.5 text-[15px] text-[#666666]">
          Invite colleagues and control what each of them can do.
        </p>
      </header>

      {notice && (
        <div
          role="status"
          className={`rounded-lg border px-4 py-3 text-[14px] font-medium ${
            notice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {notice.text}
        </div>
      )}

      {mayInvite && (
        <section>
          <h2 className="mb-3 text-[15px] font-bold text-[#111111]">Invite someone</h2>
          <form onSubmit={submitInvite} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-1.5">
              <label htmlFor="invite-email" className="text-[12px] font-semibold text-[#666666]">
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999999]" />
                <input
                  id="invite-email"
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  placeholder="colleague@company.com"
                  className={`${inputClass} w-full pl-9`}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="invite-role" className="text-[12px] font-semibold text-[#666666]">
                Role
              </label>
              <select
                id="invite-role"
                value={inviteRole}
                onChange={(event) => setInviteRole(event.target.value as Role)}
                className={inputClass}
              >
                {/* Only roles strictly below the inviter's: an admin minting an
                    owner would be privilege escalation by proxy, and the API
                    rejects it anyway. */}
                {ROLES.filter((role) => outranks(viewerRole, role)).map((role) => (
                  <option key={role} value={role}>
                    {ROLE_DESCRIPTIONS[role].label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={inviting}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#FF6B00] px-4 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-[#E65A00] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2"
            >
              {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              Send invite
            </button>
          </form>
          <p className="mt-2 text-[13px] text-[#888888]">
            {ROLE_DESCRIPTIONS[inviteRole].description}
          </p>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-[15px] font-bold text-[#111111]">
          Members <span className="font-normal text-[#888888]">({members.length})</span>
        </h2>
        <div className="overflow-hidden rounded-xl border border-[#EEE8E2]">
          <table className="w-full text-left text-[14px]">
            <thead className="border-b border-[#EEE8E2] bg-[#FAF7F3] text-[11px] uppercase tracking-wider text-[#888888]">
              <tr>
                <th className="px-4 py-3 font-semibold">Member</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 text-right font-semibold">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEE8E2]">
              {members.map((member) => {
                const actionable = !member.isYou && member.id !== viewerId && outranks(viewerRole, member.role);
                return (
                  <tr key={member.id} className="transition-colors hover:bg-[#FAF7F3]">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[#111111]">
                        {member.fullName || member.email.split("@")[0]}
                        {member.isYou && <span className="ml-2 text-[12px] font-normal text-[#888888]">(you)</span>}
                      </div>
                      <div className="text-[13px] text-[#666666]">{member.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      {mayChangeRoles && actionable ? (
                        <select
                          aria-label={`Role for ${member.email}`}
                          value={member.role}
                          disabled={busyId === member.id}
                          onChange={(event) => changeRole(member, event.target.value as Role)}
                          className={inputClass}
                        >
                          {ROLES.map((role) => (
                            <option key={role} value={role}>
                              {ROLE_DESCRIPTIONS[role].label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="inline-flex rounded border border-[#EEE8E2] bg-[#FAF7F3] px-2 py-1 text-[12px] font-semibold text-[#111111]">
                          {ROLE_DESCRIPTIONS[member.role].label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {mayInvite && actionable && (
                        <button
                          onClick={() => removeMember(member)}
                          disabled={busyId === member.id}
                          aria-label={`Remove ${member.email}`}
                          className="inline-flex items-center gap-1.5 rounded-md border border-[#EEE8E2] px-3 py-1.5 text-[13px] font-medium text-[#666666] transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {invites.length > 0 && (
        <section>
          <h2 className="mb-3 text-[15px] font-bold text-[#111111]">Pending invitations</h2>
          <ul className="divide-y divide-[#EEE8E2] overflow-hidden rounded-xl border border-[#EEE8E2]">
            {invites.map((invite) => (
              <li key={invite.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-semibold text-[#111111]">{invite.email}</div>
                  <div className="text-[13px] text-[#666666]">
                    {ROLE_DESCRIPTIONS[invite.role].label} ·{" "}
                    {invite.expired
                      ? "expired — send a new invite"
                      : `expires ${new Date(invite.expiresAt).toLocaleDateString()}`}
                  </div>
                </div>
                {mayInvite && (
                  <button
                    onClick={() => revokeInvite(invite)}
                    disabled={busyId === invite.id}
                    aria-label={`Revoke invitation for ${invite.email}`}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-[#EEE8E2] px-3 py-1.5 text-[13px] font-medium text-[#666666] transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
                  >
                    <X className="h-3.5 w-3.5" />
                    Revoke
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
