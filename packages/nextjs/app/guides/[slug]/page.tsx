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
    canonicalPath: `/guides/${guide.slug}`,
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Article",
                headline: guide.title,
                description: guide.description,
                image: guide.image
                  ? `https://speedrunethereum.com${guide.image}`
                  : "https://speedrunethereum.com/thumbnail.png",
                mainEntityOfPage: `https://speedrunethereum.com/guides/${guide.slug}`,
                publisher: {
                  "@type": "Organization",
                  name: "Speedrun Ethereum",
                  url: "https://speedrunethereum.com",
                },
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: "https://speedrunethereum.com/",
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Guides",
                    item: "https://speedrunethereum.com/guides",
                  },
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: guide.title,
                    item: `https://speedrunethereum.com/guides/${guide.slug}`,
                  },
                ],
              },
            ],
          }),
        }}
      />
      <div className="rounded-b-xl bg-white dark:bg-base-100/50 shadow-sm p-6 sm:p-12">
        <h1 className="text-4xl font-bold">{guide.title}</h1>
        <div className="prose dark:prose-invert max-w-none mt-4">{guide.content}</div>
      </div>
    </div>
  );
}
