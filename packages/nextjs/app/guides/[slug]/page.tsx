import { notFound } from "next/navigation";
import { GuideSidebar } from "../_components/GuideSidebar";
import { formatGuideDate, getAllGuidesSlugs, getGuideBySlug } from "~~/services/guides";
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
    path: `/guides/${params.slug}`,
  });
}

export default async function GuidePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const guide = await getGuideBySlug(params.slug);

  if (!guide) {
    return notFound();
  }

  const faqSchema = guide.faqs
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: guide.faqs.map(faq => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      }
    : null;

  const showNavigation = guide.showNavigation && guide.headings.length > 0;

  // When navigation is shown, the hero and the article share a single 2-column grid (TOC + content)
  // so the heading and the article card line up, and the TOC sits in its own left column.
  const containerClass = showNavigation ? "max-w-[1200px] mx-auto px-4 lg:px-6" : "max-w-[860px] mx-auto px-4 lg:px-6";
  const gridClass = showNavigation ? "lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10" : "";

  const heroHeader = (
    <>
      <h1 className="text-3xl lg:text-4xl font-extrabold text-base-content mb-3">{guide.title}</h1>
      {guide.description && <p className="text-lg text-base-content/90 mb-4">{guide.description}</p>}
      <div className="text-sm text-base-content/80 flex items-center gap-4 flex-wrap">
        {guide.date && <span>📅 {formatGuideDate(guide.date)}</span>}
        <span>🕐 {guide.readingTime} min read</span>
      </div>
    </>
  );

  const contentCard = (
    <div className="bg-white dark:bg-base-100/50 shadow-sm rounded-xl p-6 sm:p-10">
      <article className="guide-prose prose dark:prose-invert max-w-none">{guide.content}</article>

      {guide.faqs && guide.faqs.length > 0 && (
        <section className="guide-faq mt-12">
          <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2 border-primary/30">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {guide.faqs.map((faq, i) => (
              <details key={i}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );

  return (
    <>
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

      <div className="bg-[#A8E7F4] dark:bg-[#015555] py-10 lg:py-14">
        <div className={`${containerClass} ${gridClass}`}>
          {showNavigation && <div className="hidden lg:block" aria-hidden />}
          <div>{heroHeader}</div>
        </div>
      </div>

      <div className={`${containerClass} ${gridClass} pt-6 pb-10 lg:pt-8 lg:pb-14`}>
        {showNavigation && <GuideSidebar headings={guide.headings} />}
        <div className="min-w-0">{contentCard}</div>
      </div>
    </>
  );
}
