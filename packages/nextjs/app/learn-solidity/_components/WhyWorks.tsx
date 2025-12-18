import { SpaceshipIcon, TargetIcon, ToolsIcon } from "../../start/_components/Icons";

export const WhyWorks = () => {
  const items = [
    {
      title: "Learn by Building",
      desc: "Every challenge teaches through hands-on practice. Each delivers a key 'aha' moment.",
      Icon: ToolsIcon,
      color: "primary" as const,
    },
    {
      title: "Real Portfolio",
      desc: "Each completed challenge becomes part of your on-chain, verifiable builder profile.",
      Icon: TargetIcon,
      color: "accent" as const,
    },
    {
      title: "Production Ready",
      desc: "Use Scaffold-ETH 2 to build production-grade dApps.",
      Icon: SpaceshipIcon,
      color: "secondary" as const,
    },
  ];

  return (
    <section className="bg-base-300">
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h3 className="text-2xl md:text-3xl font-bold">Why Speedrun Ethereum Works</h3>
          <p className="text-base-content/70 mt-2">
            Our hands-on approach gets you building real projects from day one
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {items.map(({ title, desc, Icon }) => {
            const iconClasses = "text-accent";
            return (
              <div key={title} className="card bg-base-100 shadow-sm">
                <div className="card-body items-center text-center">
                  <div className={`mb-3 ${iconClasses}`}>
                    <Icon />
                  </div>
                  <h4 className="card-title justify-center">{title}</h4>
                  <p className="text-sm text-base-content/80">{desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
