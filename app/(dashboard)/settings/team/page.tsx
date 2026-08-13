import { redirect } from "next/navigation";
import { getServerAuthContext } from "@/lib/server/auth";
import TeamManager from "./TeamManager";

/**
 * Team management.
 *
 * The viewer's role is resolved on the server and handed to the client
 * component so the UI can hide actions it isn't allowed to take. That is
 * presentation only — every mutation is independently authorized in the route
 * handler, because a hidden button is not a permission check.
 */
export default async function TeamSettingsPage() {
  const auth = await getServerAuthContext();
  if (!auth) redirect("/auth/login");

  return <TeamManager viewerRole={auth.role} viewerId={auth.userId ?? ""} />;
}
