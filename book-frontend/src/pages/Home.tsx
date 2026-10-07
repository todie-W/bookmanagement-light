import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 px-6 py-16 text-white shadow-xl shadow-indigo-950/10 sm:px-12 sm:py-20">
      <div className="max-w-2xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-200">
          Deine Bücher. Ein Ort.
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Willkommen bei deiner Buchverwaltung
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-indigo-100">
          Entdecke deine Sammlung, verwalte deine Bücher und merke dir, was du als Nächstes lesen möchtest.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/books" className="rounded-xl bg-white px-5 py-3 font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50">
            Bücher entdecken
          </Link>
          <Link to="/reading-list" className="rounded-xl border border-white/30 px-5 py-3 font-semibold text-white transition hover:bg-white/10">
            Zur Merkliste
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Home;
