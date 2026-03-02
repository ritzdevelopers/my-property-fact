import ManageBanners from "../manage-banners/manageBanners";

export const dynamic = "force-dynamic";

function getHomeBannersUrl() {
  const base = (process.env.NEXT_PUBLIC_API_URL || "").trim().replace(/\/?$/, "");
  return base ? `${base}/home-banner/all` : "";
}

async function fetchHomeBanners() {
  const url = getHomeBannersUrl();
  if (!url) return [];
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) return await res.json();
  } catch (_) {
    // ignore
  }
  return [];
}

export default async function ManageHomeBannersPage() {
  const list = await fetchHomeBanners();
  return (
    <ManageBanners
      list={list}
      config={{
        addButtonLabel: "+ Add Home Banner",
        headingLabel: "Manage Home Banners",
        showTabletBannerColumn: true,
        showProjectSelect: false,
        showProjectNameColumn: false,
        showAltTag: false,
        uploadEndpoint: "home-banner/add-banners",
        showBannerLink: true,
        deleteEndpoint: "home-banner/delete",
      }}
    />
  );
}
