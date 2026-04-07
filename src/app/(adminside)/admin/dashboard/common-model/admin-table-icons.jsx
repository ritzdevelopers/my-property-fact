"use client";

/** Public URLs — encode space in filename for reliable requests */
export const ADMIN_TABLE_EDIT_ICON_SRC = "/images/admin/Vector%20(5).svg";
export const ADMIN_TABLE_DELETE_ICON_SRC = "/images/admin/delete.svg";

const imgCommon = {
  alt: "",
  draggable: false,
  decoding: "async",
};

export function AdminTableEditIcon({
  className = "",
  width = 20,
  height = 20,
  style,
}) {
  return (
    <img
      src={ADMIN_TABLE_EDIT_ICON_SRC}
      width={width}
      height={height}
      className={
        className
          ? `admin-table-action-icon ${className}`.trim()
          : "admin-table-action-icon"
      }
      style={{ display: "block", ...style }}
      {...imgCommon}
    />
  );
}

export function AdminTableDeleteIcon({
  className = "",
  width = 14,
  height = 18,
  style,
}) {
  return (
    <img
      src={ADMIN_TABLE_DELETE_ICON_SRC}
      width={width}
      height={height}
      className={
        className
          ? `admin-table-action-icon ${className}`.trim()
          : "admin-table-action-icon"
      }
      style={{ display: "block", ...style }}
      {...imgCommon}
    />
  );
}
