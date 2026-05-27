import { Suspense, cache } from "react";
import Providers from "./providers/Providers";
import { SiteDataProvider } from "./contexts/SiteDataContext";
import { fetchSiteDataFromApi } from "./siteData/fetchSiteDataApi";

const getSiteDataForRootLayout = cache(async () => {
  try {
    return await fetchSiteDataFromApi();
  } catch (err) {
    console.error("Server site data fetch failed:", err);
    return null;
  }
});

export default async function SiteDataShell({ children }) {
  const initialSiteData = await getSiteDataForRootLayout();

  return (
    <Providers>
      <Suspense fallback={null}>
        <SiteDataProvider initialData={initialSiteData}>{children}</SiteDataProvider>
      </Suspense>
    </Providers>
  );
}
