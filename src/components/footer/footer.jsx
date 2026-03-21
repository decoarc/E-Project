import "./footer.css";

export default function Footer() {
  return (
    <footer className="siteFooter">
      <div className="container">
        <small className="siteFooterCopy">
          © {new Date().getFullYear()} E-Project — Exclusive street luxury
        </small>
      </div>
    </footer>
  );
}
