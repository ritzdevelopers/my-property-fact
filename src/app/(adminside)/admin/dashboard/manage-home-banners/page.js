import ManageBanners from "../manage-banners/manageBanners";

export const dynamic = "force-dynamic";

export default async function ManageHomeBannersPage() {
  return (
    <ManageBanners
      list={[]}
      config={{
        addButtonLabel: "+ Add Home Banner",
        headingLabel: "Manage Home Banners",
        showTabletBannerColumn: true,
        showProjectSelect: false,
        showProjectNameColumn: false,
        showAltTag: false,
      }}
    />
  );
}
