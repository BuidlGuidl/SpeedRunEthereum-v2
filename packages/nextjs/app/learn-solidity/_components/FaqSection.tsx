import { faqs } from "./data";

export const FaqSection = () => {
  return (
    <section id="faq" className="container mx-auto px-6 py-16">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">Solidity Course FAQs</h2>
      <div className="max-w-3xl mx-auto">
        {faqs.map((item, idx) => (
          <div key={idx} className="collapse collapse-arrow bg-base-100 mb-3 shadow-sm">
            <input type="checkbox" />
            <div className="collapse-title text-lg font-medium">{item.q}</div>
            <div className="collapse-content">
              <p className="text-base-content/80">{item.a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
