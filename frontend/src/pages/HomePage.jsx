import { Link } from 'react-router-dom';

const highlights = [
  { label: 'Live campus assets', value: '120+' },
  { label: 'Monthly booking actions', value: '850+' },
  { label: 'University roles supported', value: '9' },
  { label: 'Notifications delivered', value: '2400+' }
];

const modules = [
  {
    title: 'Facilities and Assets',
    subtitle: 'Lecture halls, labs, studios, and shared equipment',
    icon: '🏛',
    accent: 'from-emerald-400/20 to-emerald-200/0'
  },
  {
    title: 'Booking Workflows',
    subtitle: 'Approval paths, conflict checks, and live availability',
    icon: '📅',
    accent: 'from-blue-400/20 to-blue-200/0'
  },
  {
    title: 'Maintenance Tickets',
    subtitle: 'Report issues, assign teams, track progress',
    icon: '🛠',
    accent: 'from-amber-400/20 to-amber-200/0'
  }
];

const roles = ['ADMIN', 'FACILITY_MANAGER', 'LECTURER', 'TECHNICIAN', 'STUDENT', 'SECURITY_OFFICER'];

const steps = [
  {
    title: 'Sign in securely',
    text: 'Use your campus account to access role-based dashboards and approvals.',
    icon: '🔐'
  },
  {
    title: 'Book or report',
    text: 'Reserve spaces, request equipment, or create ticket requests in seconds.',
    icon: '🧾'
  },
  {
    title: 'Track everything',
    text: 'Get real-time updates on approvals, status changes, and comments.',
    icon: '🔔'
  }
];

function HomePage() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <section className="relative overflow-hidden bg-[#061944] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.22),transparent_38%),radial-gradient(circle_at_80%_12%,rgba(59,130,246,0.22),transparent_30%)]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:44px_44px]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-8">
          <div className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/5 px-5 py-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/90 text-lg">⚡</div>
              <div>
                <p className="text-lg font-bold">Smart Campus</p>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-300">Operations Platform</p>
              </div>
            </div>
            <div className="hidden items-center gap-3 sm:flex">
              <Link to="/login" className="rounded-xl border border-white/30 px-5 py-2 text-sm font-semibold hover:bg-white/10">
                Sign in
              </Link>
              <Link to="/signup" className="rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 hover:brightness-110">
                Get started
              </Link>
            </div>
          </div>

          <div className="mt-14 grid items-center gap-10 lg:grid-cols-[1.1fr,0.9fr]">
            <div>
              <p className="inline-block rounded-full border border-emerald-300/40 bg-emerald-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-emerald-200">
                Built for real universities
              </p>
              <h1 className="mt-5 text-5xl font-black leading-[1.03] sm:text-6xl">
                Operate your campus smarter with one connected system.
              </h1>
              <p className="mt-6 max-w-xl text-lg text-slate-200">
                Manage facilities, bookings, maintenance tickets, and notifications through a fast, role-aware platform made for campus workflows.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/signup" className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-slate-950 hover:brightness-110">
                  Create account
                </Link>
                <Link to="/login" className="rounded-xl border border-white/35 px-6 py-3 text-sm font-bold hover:bg-white/10">
                  Open portal
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur">
              <img
                src="https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1400&q=80"
                alt="University collaboration space"
                className="h-72 w-full rounded-2xl object-cover"
              />
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#041234]/80 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-300">Active bookings</p>
                  <p className="mt-1 text-xl font-extrabold text-emerald-300">16</p>
                </div>
                <div className="rounded-xl bg-[#041234]/80 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-300">Open tickets</p>
                  <p className="mt-1 text-xl font-extrabold text-amber-300">7</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-10 max-w-7xl px-6">
        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
          {highlights.map((item) => (
            <article key={item.label} className="rounded-xl border border-slate-100 bg-slate-50 p-5">
              <p className="text-3xl font-black text-[#0c2d6b]">{item.value}</p>
              <p className="mt-2 text-sm text-slate-600">{item.label}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">Platform modules</p>
          <h2 className="mt-2 text-4xl font-black text-slate-900">Everything your operations team needs</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {modules.map((module) => (
            <article key={module.title} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
              <div className={`absolute inset-0 -z-0 bg-gradient-to-b ${module.accent} opacity-0 transition group-hover:opacity-100`} />
              <p className="relative z-10 text-3xl">{module.icon}</p>
              <h3 className="relative z-10 mt-4 text-xl font-bold text-slate-900">{module.title}</h3>
              <p className="relative z-10 mt-2 text-sm text-slate-600">{module.subtitle}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#081a44] py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[1.2fr,0.8fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Role-aware experience</p>
            <h2 className="mt-3 text-4xl font-black">Designed for administrators, lecturers, technicians, and students.</h2>
            <p className="mt-4 max-w-2xl text-lg text-slate-200">
              Each user sees what matters to their role. Fewer distractions, faster actions, and cleaner collaboration between teams.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {roles.map((role) => (
                <span key={role} className="rounded-full border border-white/25 bg-white/10 px-4 py-1 text-xs font-semibold">
                  {role}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-white/20 bg-white/5 p-6">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-xl border border-white/15 bg-[#081739]/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">Step {index + 1}</p>
                <h3 className="mt-1 flex items-center gap-2 text-lg font-bold">
                  <span>{step.icon}</span>
                  {step.title}
                </h3>
                <p className="mt-1 text-sm text-slate-200">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-16 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Why this platform works</p>
          <h3 className="mt-3 text-3xl font-black text-slate-900">Balanced between premium and practical.</h3>
          <ul className="mt-5 space-y-3 text-slate-700">
            <li>• Built around real university workflows, not generic templates.</li>
            <li>• Connects booking, maintenance, and notifications in one place.</li>
            <li>• Designed for speed on both desktop and mobile devices.</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Campus in motion</p>
          <h3 className="mt-3 text-3xl font-black text-slate-900">See the product style in action.</h3>
          <p className="mt-2 text-slate-600">Preview-style media section for demos, viva presentations, and onboarding.</p>
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="h-64 w-full object-cover"
              poster="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80"
            >
              <source src="https://cdn.coverr.co/videos/coverr-students-in-a-library-1579/1080p.mp4" type="video/mp4" />
            </video>
          </div>
        </article>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-800 to-emerald-600 p-10 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_40%,rgba(255,255,255,0.18),transparent_35%)]" />
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100">Ready to explore</p>
              <h3 className="mt-2 text-4xl font-black">Make your campus operations smoother today.</h3>
            </div>
            <div className="flex gap-3">
              <Link to="/login" className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-emerald-900">
                Sign in now
              </Link>
              <Link to="/signup" className="rounded-xl border border-white/40 px-6 py-3 text-sm font-bold text-white">
                Create account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
