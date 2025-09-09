import { notFound } from "next/navigation";
import { getAllGuidesSlugs, getGuideBySlug } from "~~/services/guides";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export async function generateStaticParams() {
  const slugs = await getAllGuidesSlugs();

  return slugs.map(slug => ({ slug }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const guide = await getGuideBySlug(params.slug);

  if (!guide) return {};

  return getMetadata({
    title: guide.title,
    description: guide.description,
    imageRelativePath: guide.image,
  });
}

export default async function GuidePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const guide = await getGuideBySlug(params.slug);

  if (!guide) {
    return notFound();
  }

  return (
    <div className="flex flex-col gap-8 px-4 pb-4 max-w-[900px] mx-auto">
      <div className="rounded-b-xl bg-white dark:bg-base-100/50 shadow-sm p-6 sm:p-12">
        <h1 className="text-4xl font-bold">{guide.title}</h1>
        <div className="prose dark:prose-invert max-w-none mt-4">{guide.content}</div>
      </div>
    </div>
  );
}
