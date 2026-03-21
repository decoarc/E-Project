import { useTranslation } from "react-i18next";
import "./footer.css";

export default function Footer() {
  const { t } = useTranslation("common");
  return (
    <footer className="siteFooter">
      <div className="container">
        <small className="siteFooterCopy">
          © {new Date().getFullYear()} E-Project — {t("footer.tagline")}
        </small>
      </div>
    </footer>
  );
}
