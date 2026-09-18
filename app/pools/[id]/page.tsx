import { redirect } from "next/navigation";

export default async function PoolTokenRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const slug = id.includes("-") ? id.split("-").slice(1).join("-") : id;
  redirect(`/token/${slug}`);
}
