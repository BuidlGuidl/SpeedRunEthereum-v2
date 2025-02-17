import { notFound } from "next/navigation";
import { getAllGuidesSlugs, getGuideBySlug } from "~~/services/guides";

// ToDo: Metadata

export async function generateStaticParams() {
  const slugs = await getAllGuidesSlugs();

  return slugs;
}

export default async function GuidePage({ params }: { params: { slug: string } }) {
  const guide = await getGuideBySlug(params.slug);

  if (!guide) {
    return notFound();
  }

  return (
    <div className="flex flex-col gap-8 p-4 max-w-[900px] mx-auto">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-bold">{guide.title}</h1>
      </div>
      <div className="prose dark:prose-invert max-w-none">{guide.content}</div>
    </div>
  );
}
