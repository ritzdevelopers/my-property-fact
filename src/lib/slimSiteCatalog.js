/**
 * Strip unused catalog fields before they are serialized into HTML / RSC payloads.
 * Header, footer, and listing filters only need names and slugs.
 */

export function slimCityForNav(city) {
  if (!city || typeof city !== "object") return city;
  const slim = {
    id: city.id,
    cityName: city.cityName || city.name || "",
    slugURL: city.slugURL || city.slugUrl || "",
  };
  if (city.isActive != null) slim.isActive = city.isActive;
  if (city.stateName) slim.stateName = city.stateName;
  return slim;
}

export function slimCityListForNav(list) {
  if (!Array.isArray(list)) return [];
  return list.map(slimCityForNav);
}

export function slimProjectTypeForNav(type) {
  if (!type || typeof type !== "object") return type;
  return {
    id: type.id,
    projectTypeName: type.projectTypeName || type.name,
    name: type.name,
    slugURL: type.slugURL || type.slugUrl,
    slugUrl: type.slugUrl || type.slugURL,
  };
}

export function slimProjectTypeListForNav(list) {
  if (!Array.isArray(list)) return [];
  return list.map(slimProjectTypeForNav);
}

export function slimProjectStatusForNav(status) {
  if (!status || typeof status !== "object") return status;
  const slim = {
    id: status.id,
    statusName: status.statusName || status.name,
  };
  if (status.code) slim.code = status.code;
  if (status.isActive != null) slim.isActive = status.isActive;
  return slim;
}

export function slimProjectStatusListForNav(list) {
  if (!Array.isArray(list)) return [];
  return list.map(slimProjectStatusForNav);
}
