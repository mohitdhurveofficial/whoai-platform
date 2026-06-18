import { redirect } from "next/navigation";

type SignupRedirectPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Preserve query params (notably ?plan=) so the pricing → signup → checkout
// funnel doesn't drop the selected plan on the way to the real auth page.
export default async function SignupRedirectPage({ searchParams }: SignupRedirectPageProps) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    if (Array.isArray(value)) value.forEach((item) => params.append(key, item));
    else if (value !== undefined) params.set(key, value);
  }
  const qs = params.toString();
  redirect(qs ? `/auth/signup?${qs}` : "/auth/signup");
}
