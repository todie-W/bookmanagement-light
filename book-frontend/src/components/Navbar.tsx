import { Link, NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-3 text-lg font-bold tracking-tight text-slate-900">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white" aria-hidden="true">
          </span>
          <span>Buchverwaltung</span>
        </Link>
        <nav aria-label="Hauptnavigation" className="flex flex-wrap items-center gap-1 text-sm font-medium">
          {[
            { to: '/books', label: 'Bücher' },
            { to: '/reading-list', label: 'Merkliste' },
            { to: '/change-book', label: 'Buch ändern' },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 transition-colors ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          <Link
            to="/add-book"
            className="ml-1 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            Buch hinzufügen
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
   