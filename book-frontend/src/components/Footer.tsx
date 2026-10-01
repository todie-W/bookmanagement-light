const Footer = () => {
  return (
    <footer className="footer sm:footer-horizontal bg-neutral text-neutral-content items-center p-4">
      <aside className="grid-flow-col items-center"></aside>

       <p>Copyright © {new Date().getFullYear()} - All right reserved</p>
        </footer>
  );
};

export default Footer;
