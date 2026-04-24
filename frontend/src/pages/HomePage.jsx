import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Resource Management',
    description: 'Coordinate lecture halls, labs, equipment, and shared spaces from one place.'
  },
  {
    title: 'Smart Notifications',
    description: 'Keep teams informed with timely operational updates and actionable alerts.'
  },
  {
    title: 'Real-time Tracking',
    description: 'Track status and capacity changes instantly for smarter campus planning.'
  }
];

function HomePage() {
  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1E3A5F] via-[#244A76] to-[#2F5B8C] px-6 py-16 text-white shadow-xl sm:px-10">
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/10" />
        <div className="absolute -bottom-20 left-1/4 h-56 w-56 rounded-full bg-[#10B981]/20" />
        <div className="relative z-10 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-200">University Operations</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">Smart Campus Operations Hub</h1>
          <p className="mt-5 max-w-2xl text-base text-slate-100 sm:text-lg">
            Streamline facility bookings, manage resources, track maintenance
          </p>
          <Link
            to="/dashboard"
            className="mt-8 inline-flex rounded-md bg-[#10B981] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Get Started
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-slate-900">Core Capabilities</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[#1E3A5F]">{feature.title}</h3>
              <p className="mt-3 text-sm text-slate-600">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
