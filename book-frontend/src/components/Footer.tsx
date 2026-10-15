const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <p className="mx-auto max-w-6xl px-4 py-5 text-center text-sm text-slate-500 sm:px-6">
        © {new Date().getFullYear()} Buchverwaltung
      </p>
    </footer>
  );
};

export default Footer;
