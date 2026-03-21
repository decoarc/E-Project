import { useTranslation } from "react-i18next";

export default function Stories() {
  const { t } = useTranslation("pages");
  return (
    <div className="container" style={{ padding: "40px 0" }}>
      <h1>{t("stories.title")}</h1>
    </div>
  );
}
