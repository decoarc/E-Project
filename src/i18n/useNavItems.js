import { useMemo } from "react";
import { useTranslation } from "react-i18next";

/**
 * Navigation tree from the `nav` namespace (`locales/<lng>/nav.json`).
 * Add or edit routes per locale for translated labels; paths stay in JSON.
 */
export function useNavItems() {
  const { t } = useTranslation("nav");
  return useMemo(() => {
    const items = t("items", { returnObjects: true });
    return Array.isArray(items) ? items : [];
  }, [t]);
}
