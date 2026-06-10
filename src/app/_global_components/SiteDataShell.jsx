import { Suspense, cache } from "react";
import Providers from "./providers/Providers";
import { SiteDataProvider } from "./contexts/SiteDataContext";
import { fetchSiteMetaFromApi } from "./siteData/fetchSiteDataApi";

const getSiteMetaForRootLayout = cache(async () => {
  try {
    return await fetchSiteMetaFromApi();
  } catch (err) {
    console.error("Server site meta fetch failed:", err);
    return null;
  }
});

export default async function SiteDataShell({ children }) {
  const initialSiteData = await getSiteMetaForRootLayout();

  return (
    <Providers>
      <Suspense fallback={null}>
        <SiteDataProvider initialData={initialSiteData}>{children}</SiteDataProvider>
      </Suspense>
    </Providers>
  );
}
