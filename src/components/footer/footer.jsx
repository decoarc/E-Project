import "./footer.css";

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--line)", padding: "24px 0" }}>
      <div className="container">
        <small style={{ color: "var(--muted)" }}>
          © {new Date().getFullYear()} E-Project (mick)
        </small>
      </div>
    </footer>
  );
}
