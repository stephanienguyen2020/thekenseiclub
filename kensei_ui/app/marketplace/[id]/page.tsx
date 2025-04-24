import TokenDetailPageClient from "./client"

export default async function TokenDetailPage({ params }: { params: { id: string } }) {
  // Await the params.id
  const id = await Promise.resolve(params.id)
  return <TokenDetailPageClient id={id} />
}
