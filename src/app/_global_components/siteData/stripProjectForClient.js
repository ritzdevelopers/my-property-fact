/**
 * Keeps only fields needed for listings, filters, and search in client/RSC payloads.
 * Drops long descriptions, gallery metadata, etc. from the global projects array.
 */
const PROJECT_LISTING_FIELDS = [
  "id",
  "projectId",
  "slugURL",
  "projectName",
  "name",
  "propertyTypeName",
  "propertyTypeId",
  "cityName",
  "cityId",
  "stateName",
  "projectAddress",
  "projectLocality",
  "builderName",
  "builderId",
  "projectStatusName",
  "projectStatusId",
  "status",
  "projectConfiguration",
  "projectPossession",
  "possession",
  "occupancyStatus",
  "occupancy",
  "facing",
  "projectPrice",
  "projectStartingPrice",
  "projectBannerImage",
  "projectThumbnailImage",
  "updatedAt",
  "updated_at",
  "createdAt",
  "created_at",
  "modifiedAt",
  "dateCreated",
];

export function stripProjectForClientPayload(project) {
  if (!project || typeof project !== "object") return project;
  const out = {};
  for (const key of PROJECT_LISTING_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(project, key)) {
      out[key] = project[key];
    }
  }
  return out;
}

export function stripProjectListForClient(projects) {
  if (!Array.isArray(projects)) return [];
  return projects.map(stripProjectForClientPayload);
}
