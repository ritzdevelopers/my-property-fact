"use client";
import { LoadingSpinner } from "@/app/(home)/contact-us/page";
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import { toast } from "react-toastify";
import CommonModal from "../common-model/common-model";
import DataTable from "../common-model/data-table";
import DashboardHeader from "../common-model/dashboardHeader";
import { useRouter } from "next/navigation";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
// Dynamically import JoditEditor with SSR disabled
const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

export default function ManageProjects({
  builderList,
  typeList,
  countryData,
  projectDetailList,
  projectStatusList,
}) {
  const router = useRouter();
  // Defining the initial state
  const initialFormData = {
    id: 0,
    builderId: 0,
    cityId: 0,
    stateId: 0,
    countryId: 0,
    propertyTypeId: 0,
    projectStatusId: 0,
    projectPrice: null,
    metaTitle: null,
    metaKeyword: null,
    metaDescription: null,
    projectName: null,
    slugURL: null,
    projectLocality: null,
    projectConfiguration: null,
    ivrNo: null,
    reraNo: null,
    reraQr: null,
    reraWebsite: null,
    locationMap: null,
    projectLogo: null,
    projectThumbnail: null,
    floorPlanDescription: null,
    locationDescription: null,
    amenityDescription: null,
    status: false,
    projectLogoPreview: null,
    projectThumbnailPreview: null,
    locationMapPreview: null,
  };

  const [validated, setValidated] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState(null);
  const [confirmBox, setConfirmBox] = useState(false);
  const [buttonName, setButtonName] = useState(null);
  const [projectId, setProjectId] = useState(0);
  const [showLoading, setShowLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadExcelFile, setUploadExcelFile] = useState(null);
  const [uploadZipFile, setUploadZipFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const allowedTypes = [
    "application/zip",
    "application/x-zip-compressed",
    "multipart/x-zip"
  ];
  const handleCountryChange = (e) => {
    const countryId = parseInt(e.target.value);
    setFormData((prev) => ({
      ...prev,
      countryId: countryId,
    }));
    const country = countryData?.find((c) => c.id === countryId);
    setStates(country ? country?.stateList : []);
    setCities([]);
  };

  const handleStateChange = (e) => {
    const stateId = parseInt(e.target.value);
    setFormData((prev) => ({
      ...prev,
      stateId: stateId,
    }));
    const state = states.find((s) => s.id === stateId);
    setCities(state ? state.cityList : []);
  };

  //Handle opening model
  const openAddModel = () => {
    setTitle("Add New Project");
    setShowModal(true);
    setButtonName("Add Project");
    setFormData(initialFormData);
    setValidated(false);
    setCities([]);
    setStates([]);
  };

  // Fetching project details
  const fetchProjectDetails = async (slugURL) => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}projects/get/${slugURL}`,
    );
    const item = response.data;
    // Dynamically update the form data with the values from the item
    setFormData({
      ...initialFormData, // You can retain the initial values if needed
      ...item, // Overwrite with item data
      amenityDescription: item.amenityDesc,
      locationDescription: item.locationDesc,
      floorPlanDescription: item.floorPlanDesc,
      locationMap: null,
      projectLogo: null,
      projectThumbnail: null,
      builderId: item.builder.id,
      locationMapPreview: `${process.env.NEXT_PUBLIC_IMAGE_URL}properties/${item.slugURL}/${item.locationMap}`,
      projectLogoPreview: `${process.env.NEXT_PUBLIC_IMAGE_URL}properties/${item.slugURL}/${item.projectLogo}`,
      projectThumbnailPreview: `${process.env.NEXT_PUBLIC_IMAGE_URL}properties/${item.slugURL}/${item.projectThumbnailImage}`,
    });
    const country = countryData?.find((c) => c.id === item.countryId);
    setStates(country ? country?.stateList : []);
    const state = country?.stateList?.find((s) => s.id === item.stateId);
    setCities(state ? state.cityList : []);
    return response.data;
  };

  //Handling opening of edit model
  const openEditModel = async (item) => {
    await fetchProjectDetails(item.slugURL);
    setTitle("Edit Project Details");
    setShowModal(true);
    setButtonName("Update Project");
  };

  //Opening delete confirmation box
  const openConfirmationBox = (id) => {
    setConfirmBox(true);
    setProjectId(id);
  };

  const handleChange = (e) => {
    const { name, type, files, value, checked } = e.target;

    if (type === "file") {
      const file = files[0];
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setFormData((prev) => ({
          ...prev,
          [name]: file,
          [`${name}Preview`]: previewUrl,
        }));
      }
    } else if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handling submitting project
  const handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      const firstInvalid = form.querySelector(":invalid");
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
        firstInvalid.focus();
      }
    }
    setValidated(true);
    if (form.checkValidity()) {
      await submitFormData();
    }
  };

  const submitFormData = async () => {
    const data = new FormData();
    if (formData.metaTitle === null || formData.metaTitle === "") {
      return;
    }
    // Append files (actual File objects, not file names)
    if (formData.projectLogo instanceof File) {
      data.append("projectLogo", formData.projectLogo);
    }
    if (formData.locationMap instanceof File) {
      data.append("locationMap", formData.locationMap);
    }
    if (formData.projectThumbnail instanceof File) {
      data.append("projectThumbnail", formData.projectThumbnail);
    }

    // Append DTO as JSON
    const dto = { ...formData };
    delete dto.projectLogo;
    delete dto.locationMap;
    delete dto.projectThumbnail;

    data.append(
      "addUpdateProjectDto",
      new Blob([JSON.stringify(dto)], { type: "application/json" }),
    );

    try {
      setShowLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}projects/add-new`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data.isSuccess === 1) {
        router.refresh();
        toast.success(response.data.message);
        setFormData(initialFormData);
        setShowModal(false);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
          "An error occurred while submitting the form.",
      );
    } finally {
      setShowLoading(false);
    }
  };

  const formFields = [
    {
      label: "Meta Title",
      name: "metaTitle",
      type: "text",
      placeholder: "Meta Title",
      required: true,
      colSize: 6,
    },
    {
      label: "Meta Description",
      name: "metaDescription",
      type: "text",
      placeholder: "Meta Description",
      required: true,
      colSize: 6,
    },
    {
      label: "Meta Keyword",
      name: "metaKeyword",
      type: "text",
      placeholder: "Meta Keyword",
      required: true,
      colSize: 6,
    },
    {
      label: "Project Name",
      name: "projectName",
      type: "text",
      placeholder: "Project Name",
      required: true,
      colSize: 6,
    },
    {
      label: "Project Locality",
      name: "projectLocality",
      type: "text",
      placeholder: "Project Locality",
      required: true,
      colSize: 6,
    },
    {
      label: "Country",
      name: "countryId",
      type: "select",
      required: true,
      colSize: 6,
      options: countryData,
      valueKey: "id",
      labelKey: "countryName",
      onChange: handleCountryChange,
    },
    {
      label: "State",
      name: "stateId",
      type: "select",
      required: true,
      colSize: 6,
      options: states,
      valueKey: "id",
      labelKey: "stateName",
      onChange: handleStateChange,
      disabled: !states.length,
    },
    {
      label: "City",
      name: "cityId",
      type: "select",
      required: true,
      colSize: 6,
      options: cities,
      valueKey: "id",
      labelKey: "cityName",
      disabled: !cities.length,
    },
    {
      label: "Project Configuration",
      name: "projectConfiguration",
      type: "text",
      placeholder: "Project Configuration",
      required: true,
      colSize: 6,
    },
    {
      label: "Project By",
      name: "builderId",
      type: "select",
      required: true,
      colSize: 6,
      options: builderList,
      valueKey: "id",
      labelKey: "builderName",
    },
    {
      label: "Location Map",
      name: "locationMap",
      previousImage: formData.locationMapPreview,
      type: "file",
      required: false,
      colSize: 6,
      width: 815,
      height: 813,
    },
    {
      label: "Project Logo",
      name: "projectLogo",
      previousImage: formData.projectLogoPreview,
      type: "file",
      required: false,
      colSize: 6,
      width: 792,
      height: 203,
    },
    {
      label: "Project Thumbnail",
      name: "projectThumbnail",
      previousImage: formData.projectThumbnailPreview,
      type: "file",
      required: false,
      colSize: 6,
      width: 600,
      height: 600,
    },
    {
      label: "Project price",
      name: "projectPrice",
      type: "text",
      placeholder: "Project price",
      required: true,
      colSize: 6,
    },
    {
      label: "Rera Number",
      name: "reraNo",
      type: "text",
      placeholder: "Reara Number",
      required: true,
      colSize: 6,
    },
    {
      label: "Rera website",
      name: "reraWebsite",
      type: "text",
      placeholder: "Rera website",
      required: false,
      colSize: 6,
    },
    {
      label: "Slug Url",
      name: "slugURL",
      type: "text",
      placeholder: "Slug url",
      required: false,
      colSize: 6,
    },
    {
      label: "IVR number",
      name: "ivrNo",
      type: "text",
      placeholder: "IVR number",
      required: false,
      colSize: 6,
    },
    {
      label: "Property type",
      name: "propertyTypeId",
      type: "select",
      required: true,
      colSize: 6,
      options: typeList,
      valueKey: "id",
      labelKey: "projectTypeName",
    },
    {
      label: "Project Status",
      name: "projectStatusId",
      type: "select",
      required: true,
      colSize: 6,
      options: projectStatusList,
      valueKey: "id",
      labelKey: "statusName",
    },
    {
      label: "Amenity Description",
      name: "amenityDescription",
      type: "jodit",
      value: formData.amenityDescription,
      required: true,
      colSize: 12, // full width
    },
    {
      label: "Location Description",
      name: "locationDescription",
      type: "jodit",
      value: formData.locationDescription,
      required: true,
      colSize: 12, // full width
    },
    {
      label: "Floor Plan Description",
      name: "floorPlanDescription",
      type: "jodit",
      value: formData.floorPlanDescription,
      required: true,
      colSize: 12, // full width
    },
  ];

  //Defining table columns
  const columns = [
    {
      field: "index",
      headerName: "S.no",
      width: 70,
      cellClassName: "centered-cell",
    },
    {
      field: "projectName",
      headerName: "Project Name",
      flex: 1,
    },
    {
      field: "builderName",
      headerName: "Project By",
      flex: 1,
    },
    {
      field: "projectLocality",
      headerName: "Project Locality",
      flex: 1,
    },
    {
      field: "projectConfiguration",
      headerName: "Project Configuration",
      flex: 1,
    },
    {
      field: "propertyTypeName",
      headerName: "Property Type",
      flex: 1,
    },
    {
      field: "projectStatusName",
      headerName: "Project Status",
      flex: 1,
    },
    {
      field: "status",
      headerName: "Draft Status",
      flex: 1,
    },
    {
      field: "action",
      headerName: "Action",
      width: 100,
      renderCell: (params) => (
        <div>
          <FontAwesomeIcon
            className="mx-3 text-danger"
            style={{ cursor: "pointer" }}
            icon={faTrash}
            onClick={() => openConfirmationBox(params.row.id)}
          />
          <FontAwesomeIcon
            className="text-warning"
            style={{ cursor: "pointer" }}
            icon={faPencil}
            onClick={() => openEditModel(params.row)}
          />
        </div>
      ),
    },
  ];

  const handleClose = async () => {
    // setShowModal(false);
    await submitFormData(); // No need for handleSubmit since there's no event
    router.refresh();
  };

  const exportAllProjectToExcel = async () => {
    let projects = [...projectDetailList]; // clone to avoid mutation

    if (!projects || projects.length === 0) {
      return;
    }

    // 🔹 Remove keys ending with "_id"
    let headers = Object.keys(projects[0]).filter(
      (key) => !key.toLowerCase().endsWith("id") || key.toLowerCase() === "id",
    );

    // 🔹 Ensure "id" is first and "project_name" is second
    headers = headers.sort((a, b) => {
      if (a === "id") return -1;
      if (b === "id") return 1;
      if (a === "projectName") return headers.includes("id") ? -1 : 1;
      if (b === "projectName") return headers.includes("id") ? 1 : -1;
      return 0;
    });

    // 🔹 Sort projects by id
    projects.sort((a, b) => (a.id || 0) - (b.id || 0));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Projects");

    // 🔹 Format headers (capitalize + replace underscores with spaces)
    const formattedHeaders = headers.map((h) =>
      h.replace(/_/g, " ").toUpperCase(),
    );

    // 🔹 Add headers row
    worksheet.addRow(formattedHeaders);

    // 🔹 Style headers
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF228B22" }, // green
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };

    // 🔹 Add filter on headers
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: headers.length },
    };

    // 🔹 Iterate over projects and add rows
    for (let rowIndex = 0; rowIndex < projects.length; rowIndex++) {
      const project = projects[rowIndex];
      const rowValues = [];

      headers.forEach((key) => {
        if (
          key === "project_image" ||
          key === "project_logo" ||
          key === "project_thumbnail"
        ) {
          rowValues.push(""); // placeholder for image
        } else if (key === "projectPrice") {
          const price = parseFloat(project[key]);
          if (!isNaN(price)) {
            if (price >= 1) {
              rowValues.push(`${parseFloat(price.toFixed(2))} Cr`);
            } else {
              rowValues.push(`${parseFloat((price * 100).toFixed(2))} Lac`);
            }
          } else {
            rowValues.push(project[key] || "");
          }
        } else {
          rowValues.push(project[key] || "");
        }
      });

      const row = worksheet.addRow(rowValues);

      // 🔹 Insert images
      headers.forEach((key, colIndex) => {
        if (
          key === "project_image" ||
          key === "project_logo" ||
          key === "project_thumbnail"
        ) {
          const imagePath = project[key]; // Can be public path or base64
          if (imagePath) {
            try {
              const imageId = workbook.addImage({
                filename: imagePath,
                extension: imagePath.split(".").pop(),
              });

              worksheet.addImage(imageId, {
                tl: { col: colIndex, row: rowIndex + 1 }, // 0-based
                ext: { width: 80, height: 80 },
              });

              worksheet.getColumn(colIndex + 1).width = 20;
              row.height = 80;
            } catch (e) {
              // Image loading error - skip this image
            }
          }
        }
      });
    }

    // 🔹 Auto size all columns with max width cap (≈30 chars ~ 200px)
    worksheet.columns.forEach((col) => {
      let maxLength = 15; // min width
      col.eachCell({ includeEmpty: true }, (cell) => {
        const len = cell.value ? cell.value.toString().length : 0;
        if (len > maxLength) maxLength = len;
      });
      col.width = Math.min(maxLength + 2, 30); // cap at 30
    });

    // 🔹 Unique file name with date-time
    const now = new Date();
    const timestamp = now
      .toISOString()
      .replace(/[-:]/g, "")
      .replace("T", "_")
      .split(".")[0];
    const fileName = `projects_list_${timestamp}.xlsx`;

    // 🔹 Export as Excel
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), fileName);
  };
  const openUploadModal = () => {
    setShowUploadModal(true);
    setUploadExcelFile(null);
    setUploadZipFile(null);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setUploadExcelFile(null);
    setUploadZipFile(null);
  };

  const handleUploadProjectsSubmit = async (e) => {
    e?.preventDefault();
    if (!uploadExcelFile || !uploadZipFile) {
      toast.error("Please select an Excel file (.xlsx or .xls)");
      return;
    }
    if (!allowedTypes.includes(uploadZipFile.type)) {
      toast.error("Please select a zip file");
      return;
    }
    if(uploadExcelFile && uploadZipFile) setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadExcelFile);
      if (uploadZipFile) {
        formData.append("imagesZip", uploadZipFile);
      }
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}excel-upload/projects`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        },
      );
      if (response.data?.isSuccess === 1) {
        toast.success(
          response.data.message ?? "Projects uploaded successfully",
        );
        closeUploadModal();
        router.refresh();
      } else {
        toast.error(response.data?.message ?? "Upload failed");
      }
    } catch (error) {
      console.log(error);
      
      const message =
        error.response?.data?.message ?? error.message ?? "Upload failed";
      toast.error(message);
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <>
      <DashboardHeader
        buttonName={"+ Add new Project"}
        functionName={openAddModel}
        heading={"Manage Projects"}
        exportExcel={"Export to excel"}
        exportFunction={exportAllProjectToExcel}
      />
      <Button className="btn btn-success mb-3" onClick={openUploadModal}>
        Upload Projects
      </Button>
      <div className="table-container">
        <DataTable list={projectDetailList} columns={columns} />
      </div>
      {/* Modal for adding a new project */}
      <Modal size="xl" show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Row>
              {formFields.map((field, index) => (
                <Form.Group
                  as={Col}
                  md={field.colSize || 6}
                  className="mb-3"
                  controlId={`form-${field.name}`}
                  key={index}
                >
                  <Form.Label className="fw-bold">{field.label}</Form.Label>

                  {field.type === "jodit" ? (
                    <JoditEditor
                      value={formData[field.name] ?? ""}
                      onBlur={(newContent) =>
                        setFormData((prev) => ({
                          ...prev,
                          [field.name]: newContent,
                        }))
                      }
                    />
                  ) : field.type === "select" ? (
                    <Form.Select
                      name={field.name}
                      value={formData[field.name] ?? ""}
                      onChange={field.onChange || handleChange}
                      disabled={field.disabled}
                      required={field.required}
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map((opt) => (
                        <option
                          key={`${opt[field.valueKey]}-${index}`}
                          value={opt[field.valueKey]}
                        >
                          {opt[field.labelKey]}
                        </option>
                      ))}
                    </Form.Select>
                  ) : field.type === "file" ? (
                    <>
                      {field.previousImage && (
                        <div>
                          <Image
                            src={field.previousImage}
                            alt="Current Project Logo"
                            width={field.width || 200}
                            height={field.height || 200}
                            className="mb-3 img-fluid rounded"
                          />
                          <br />
                        </div>
                      )}
                      <Form.Control
                        type="file"
                        name={field.name}
                        onChange={field.onChange || handleChange}
                        required={field.required}
                        disabled={field.disabled}
                      />
                    </>
                  ) : (
                    <Form.Control
                      type={field.type}
                      name={field.name}
                      placeholder={field.placeholder}
                      value={formData[field.name] || ""}
                      onChange={field.onChange || handleChange}
                      required={field.required}
                      disabled={field.disabled}
                    />
                  )}
                  <Form.Control.Feedback type="invalid">
                    {field.label} is required!
                  </Form.Control.Feedback>
                </Form.Group>
              ))}
            </Row>
            <Row>
              <Form.Check
                type="switch"
                id="custom-switch"
                name="status"
                label="Publish Project"
                checked={formData.status || false}
                onChange={handleChange}
              />
            </Row>
            {/* <Row> */}

            <Button
              className="mt-3 btn btn-success"
              type="submit"
              disabled={showLoading}
            >
              {buttonName} <LoadingSpinner show={showLoading} />
            </Button>
            <Button
              className="mt-3 ms-3 btn btn-secondary"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            {/* </Row> */}
          </Form>
        </Modal.Body>
      </Modal>
      {/* Upload Projects Modal (Excel + optional Zip) */}
      <Modal show={showUploadModal} onHide={closeUploadModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Upload Projects</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUploadProjectsSubmit}>
            <Form.Group className="mb-3" controlId="uploadExcel">
              <Form.Label className="fw-bold">
                Excel file <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) =>
                  setUploadExcelFile(e.target.files?.[0] ?? null)
                }
                required
              />
              <Form.Text className="text-muted">
                .xlsx or .xls with project data
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3" controlId="uploadZip">
              <Form.Label className="fw-bold">Images zip</Form.Label>
              <Form.Control
                type="file"
                accept=".zip"
                onChange={(e) => setUploadZipFile(e.target.files?.[0] ?? null)}
                required
              />
              <Form.Text className="text-muted">
                .zip with images named like
                ProjectName_ImageType_My-Property-Fact
              </Form.Text>
            </Form.Group>
            <div className="d-flex gap-2 justify-content-end">
              <Button
                variant="secondary"
                onClick={closeUploadModal}
                disabled={uploadLoading}
              >
                Cancel
              </Button>
              <Button
                variant="success"
                type="submit"
                disabled={uploadLoading || !uploadExcelFile || !uploadZipFile}
              >
                {uploadLoading ? (
                  <>
                    <LoadingSpinner show={true} /> Uploading…
                  </>
                ) : (
                  "Upload"
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      <CommonModal
        confirmBox={confirmBox}
        setConfirmBox={setConfirmBox}
        api={`${process.env.NEXT_PUBLIC_API_URL}projects/delete/${projectId}`}
      />
    </>
  );
}
