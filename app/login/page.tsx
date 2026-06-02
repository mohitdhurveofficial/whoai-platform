import { redirect } from "next/navigation";

type LoginRedirectPageProps = {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

function buildQueryString(searchParams: Awaited<LoginRedirectPageProps["searchParams"]>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
    } else if (value !== undefined) {
      params.set(key, value);
    }
  }

  return params.toString();
}

export default async function LoginRedirectPage({ searchParams }: LoginRedirectPageProps) {
  const queryString = buildQueryString(await searchParams);

  redirect(queryString ? `/auth/login?${queryString}` : "/auth/login");
}
