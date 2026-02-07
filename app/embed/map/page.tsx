import EmbedMapClient from "./EmbedMapClient";

export const dynamic = "force-dynamic";

export default function Page({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const pick = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

  const agency = pick(searchParams.agency) ?? "bernabeu";
  const role = pick(searchParams.role) ?? "PARTICULAR";
  const access = pick(searchParams.access) ?? "granted";

  return <EmbedMapClient agency={agency} role={role} access={access} />;
}