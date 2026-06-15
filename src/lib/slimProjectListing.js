/**
 * Strip unused API fields before serializing project rows into HTML / RSC payloads.
 * Keeps everything listing cards, filters, and search need.
 */
export function slimProjectForListing(project) {
  if (!project || typeof project !== "object") return project;

  const slim = {
    id: project.id,
    slugURL: project.slugURL,
    projectName: project.projectName,
    propertyTypeName: project.propertyTypeName,
    projectPrice: project.projectPrice,
    projectAddress: project.projectAddress,
    projectBannerImage: project.projectBannerImage,
    projectThumbnailImage: project.projectThumbnailImage,
    projectStatusName: project.projectStatusName,
    projectConfiguration: project.projectConfiguration,
    projectLogo: project.projectLogo,
    cityName: project.cityName,
    projectLocality: project.projectLocality,
    builderName: project.builderName,
    status: project.status,
  };

  if (project.propertyTypeId != null) slim.propertyTypeId = project.propertyTypeId;
  if (project.cityId != null) slim.cityId = project.cityId;
  if (project.builderId != null) slim.builderId = project.builderId;
  if (project.projectStatusId != null) slim.projectStatusId = project.projectStatusId;
  if (project.projectPossession != null) slim.projectPossession = project.projectPossession;
  if (project.possession != null) slim.possession = project.possession;
  if (project.occupancyStatus != null) slim.occupancyStatus = project.occupancyStatus;
  if (project.occupancy != null) slim.occupancy = project.occupancy;
  if (project.facing != null) slim.facing = project.facing;

  return slim;
}

export function slimProjectListForListing(list) {
  if (!Array.isArray(list)) return [];
  return list.map(slimProjectForListing);
}
