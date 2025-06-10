import React from "react";
import { notFound } from "next/navigation";
import { H2 } from "../../../components/MarkdownHeading";
import { getAllGuidesSlugs, getGuideBySlug } from "~~/services/guides";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export async function generateStaticParams() {
  const slugs = await getAllGuidesSlugs();

  return slugs.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const guide = await getGuideBySlug(params.slug);

  if (!guide) return {};

  return getMetadata({
    title: guide.title,
    description: guide.description,
    imageRelativePath: guide.image,
  });
}

export default async function GuidePage({ params }: { params: { slug: string } }) {
  const guide = await getGuideBySlug(params.slug);

  if (!guide) {
    return notFound();
  }

  return (
    <div className="flex flex-col lg:flex-row gap-16 p-4 max-w-[1100px] mx-auto">
      {/* Table of Contents */}
      <aside className="hidden lg:block order-last lg:order-first lg:w-56 text-sm lg:ml-0 lg:pr-8">
        <h2 className="font-semibold mb-2">On this page</h2>
        <ul className="space-y-1">
          {guide.toc?.map(item => (
            <li key={item.id}>
              <a href={`#${item.id}`} className="hover:underline">
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </aside>

      {/* Guide Content */}
      <div className="flex flex-col gap-4 flex-1">
        <h1 className="text-4xl font-bold">{guide.title}</h1>
        <article className="prose dark:prose-invert max-w-none">
          {React.cloneElement(guide.content, { components: { h2: H2 } })}
        </article>
      </div>
    </div>
  );
}
