import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation("pages");
  return (
    <div className="container" style={{ padding: "40px 0" }}>
      <h1>{t("notFound.title")}</h1>
      <p>{t("notFound.message")}</p>
    </div>
  );
}
