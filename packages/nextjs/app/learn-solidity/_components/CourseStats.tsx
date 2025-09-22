export const CourseStats = () => {
  return (
    <section className="container mx-auto px-6 py-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="card bg-base-100 text-center border-primary border shadow-sm">
          <div className="card-body p-6 items-center">
            <div className="text-3xl font-bold text-primary">8+</div>
            <div className="text-sm text-base-content/70">Core Challenges</div>
          </div>
        </div>
        <div className="card bg-base-100 text-center border-primary border shadow-sm">
          <div className="card-body p-6 items-center">
            <div className="text-3xl font-bold text-primary">20+</div>
            <div className="text-sm text-base-content/70">Guides and Tutorials</div>
          </div>
        </div>
        <div className="card bg-base-100 text-center border-primary border shadow-sm col-span-2 md:col-span-1">
          <div className="card-body p-6 items-center">
            <div className="text-3xl font-bold text-primary">120+</div>
            <div className="text-sm text-base-content/70">XP Points</div>
          </div>
        </div>
      </div>
    </section>
  );
};
