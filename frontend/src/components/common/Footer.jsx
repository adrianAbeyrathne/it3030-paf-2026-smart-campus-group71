function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-800/40 bg-[#081a44] text-slate-100">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-3">
        <div>
          <p className="text-xl font-bold">Smart Campus</p>
          <p className="mt-2 text-sm text-slate-300">Operations Hub</p>
          <p className="mt-4 text-sm text-slate-300">
            Built to streamline facility bookings, maintenance requests, and notifications across university teams.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Quick links</p>
          <div className="mt-3 space-y-2 text-sm text-slate-300">
            <p>Resources</p>
            <p>Bookings</p>
            <p>Notifications</p>
            <p>User management</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Contact</p>
          <div className="mt-3 space-y-2 text-sm text-slate-300">
            <p>Email: support@smartcampus.lk</p>
            <p>Phone: +94 11 000 0000</p>
            <p>Hours: 08:00 - 18:00</p>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-700/40 px-6 py-4 text-center text-xs text-slate-400">
        {new Date().getFullYear()} Smart Campus Operations Hub. Designed for your team.
      </div>
    </footer>
  );
}

export default Footer;
