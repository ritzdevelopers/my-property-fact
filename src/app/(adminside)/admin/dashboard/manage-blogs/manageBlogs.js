"use client";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import axios from "axios";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useEffect, useRef, useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import CommonModal from "../common-model/common-model";
import Image from "next/image";
import ImageUrlPopup from "../common-model/imageiurl-popup";
import DataTable from "../common-model/data-table";
import DashboardHeader from "../common-model/dashboardHeader";
import { useRouter } from "next/navigation";
import exportOverlayStyles from "./manageBlogsExportOverlay.module.css";
// 🔥 This prevents SSR errors
const Editor = dynamic(() => import("../common-model/joe-editor"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

function parseBlogDate(value) {
  if (value == null) return null;
  if (typeof value === "string") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (Array.isArray(value) && value.length >= 3) {
    const [y, m, d, h = 0, min = 0, s = 0] = value;
    return new Date(y, m - 1, d, h, min, s);
  }
  return null;
}

function formatPublishedDateTime(value) {
  const d = parseBlogDate(value);
  if (!d) return "—";
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function extractImgSrcsFromHtml(html) {
  if (!html || typeof html !== "string") return "";
  const urls = [];
  const re = /<img[^>]+src=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    urls.push(m[1]);
  }
  return [...new Set(urls)].join("; ");
}

async function fetchImageAsBase64(url) {
  const res = await fetch(url, { mode: "cors" });
  if (!res.ok) throw new Error(`Image fetch ${res.status}`);
  const blob = await res.blob();
  const ext = blob.type.includes("png")
    ? "png"
    : blob.type.includes("gif")
      ? "gif"
      : "jpeg";
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      const b64 =
        typeof dataUrl === "string" ? dataUrl.split(",")[1] : null;
      resolve(b64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  if (!base64) throw new Error("Could not read image");
  return { base64, extension: ext };
}

const EXCEL_EXPORT_UI_INITIAL = {
  open: false,
  phase: "idle",
  step: "images",
  imageDone: 0,
  imageTotal: 0,
};

export default function ManageBlogs({ list, categoryList, cityList }) {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState(null);
  const [buttonName, setButtonName] = useState("Submit");
  const [showLoading, setShowLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  const [blogDescription, setBlogDescription] = useState("");
  const [blogId, setBlogId] = useState(0);
  const [confirmBox, setConfirmBox] = useState(false);
  const [previousBlogImage, setPreviousBlogImage] = useState(null);
  const [urlPopUp, setUrlPopUp] = useState(false);
  const router = useRouter();
  const [isShowCityDropDown, setIsShowCityDropDown] = useState(false);
  const [excelExportUi, setExcelExportUi] = useState(EXCEL_EXPORT_UI_INITIAL);
  const excelExportInProgressRef = useRef(false);

  useEffect(() => {
    if (excelExportUi.phase !== "success" || !excelExportUi.open) return;
    const t = setTimeout(() => {
      setExcelExportUi(EXCEL_EXPORT_UI_INITIAL);
    }, 2800);
    return () => clearTimeout(t);
  }, [excelExportUi.phase, excelExportUi.open]);

  //Definign input fields for blog form

  const inputFields = {
    blogTitle: "",
    blogKeywords: "",
    blogMetaDescription: "",
    blogDescription: "",
    slugUrl: "",
    blogImage: null,
    status: 1,
    blogCategory: "",
    id: 0,
    cityId: 0,
  };

  const [formData, setFormData] = useState(inputFields);

  //Handle submitting blog form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    if (form.checkValidity() === true) {
      setShowLoading(true);
      setButtonName("");
      if (blogId > 0) {
        formData.id = blogId;
      }
      const data = new FormData();
      data.append("blogTitle", formData.blogTitle);
      data.append("blogKeywords", formData.blogKeywords);
      data.append("blogMetaDescription", formData.blogMetaDescription);
      data.append("blogDescription", blogDescription);
      data.append("slugUrl", formData.slugUrl);
      data.append("image", formData.blogImage);
      data.append("blogCategory", formData.blogCategory);
      data.append("id", formData.id);
      data.append("cityId", formData.cityId);

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}blog/add-update`,
          data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data.isSuccess === 1) {
          router.refresh();
          toast.success(response.data.message);
          setShowModal(false);
          setFormData(inputFields);
          setBlogDescription("");
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        // Handle error response from backend
        if (error.response && error.response.data) {
          const errorData = error.response.data;
          
          // Check if it's a validation error with multiple fields
          if (errorData.errors && typeof errorData.errors === 'object') {
            // Multiple validation errors
            const errorMessages = Object.values(errorData.errors).join(', ');
            toast.error(errorMessages);
          } else if (errorData.message) {
            // Single error message
            toast.error(errorData.message);
          } else if (errorData.error) {
            // Error object with 'error' field
            toast.error(errorData.error);
          } else {
            // Fallback to status text or generic message
            toast.error(error.response.statusText || "An error occurred");
          }
        } else if (error.message) {
          // Network or other axios errors
          toast.error(error.message);
        } else {
          toast.error("An unexpected error occurred");
        }
      } finally {
        setShowLoading(false);
        setButtonName("Add Blog");
      }
    }
  };

  //Handle deletion of blog
  const openConfirmationBox = (id) => {
    setConfirmBox(true);
    setBlogId(id);
  };

  //Handling edition of Blog
  const openEditModel = (item) => {
    setTitle("Edit Blog");
    setButtonName("Update");
    setShowModal(true);
    setValidated(false);
    setBlogId(item.id);
    setBlogDescription(item.blogDescription);
    setPreviousBlogImage(item.blogImage);
    item.categoryId == 5
      ? setIsShowCityDropDown(true)
      : setIsShowCityDropDown(false);

    setFormData({
      blogTitle: item.blogTitle,
      blogKeywords: item.blogKeywords,
      blogMetaDescription: item.blogMetaDescription,
      slugUrl: item.slugUrl,
      blogCategory: item.categoryId,
      id: item.id,
      cityId: item.cityId,
    });
  };

  //Handle setting input fields values
  const handleChange = (e) => {
    const { name, value, files, type } = e.target;

    if (type === "file") {
      setFormData((prevState) => ({
        ...prevState,
        [name]: files[0],
      }));
    } else {
      if (name === "blogCategory") {
        if (value === "5") {
          setIsShowCityDropDown(true);
        } else {
          setIsShowCityDropDown(false);
        }
      }
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  //Handle opening of add blog form
  const openAddModel = () => {
    setTitle("Add Blog");
    setShowModal(true);
    setValidated(false);
    setButtonName("Add Blog");
    setFormData(inputFields);
    setBlogDescription("");
    setPreviousBlogImage(null);
    setBlogId(0);
  };

  //handling opening of image urls popup
  const openImageUrlPopup = () => {
    setUrlPopUp(true);
  };

  const exportBlogsToExcel = async () => {
    const blogs = Array.isArray(list) ? [...list] : [];
    if (!blogs.length) {
      toast.warning("No blogs to export.");
      return;
    }
    if (excelExportInProgressRef.current) return;
    excelExportInProgressRef.current = true;

    const imageBase = process.env.NEXT_PUBLIC_IMAGE_URL || "";
    const imageTotal = blogs.filter(
      (b) => !!(b.blogImage && String(b.blogImage).trim())
    ).length;

    setExcelExportUi({
      open: true,
      phase: "loading",
      step: "images",
      imageDone: 0,
      imageTotal,
    });

    const headers = [
      "S.no",
      "ID",
      "Title",
      "Keywords",
      "Meta description",
      "Description (HTML)",
      "Slug URL",
      "Category",
      "City",
      "Status",
      "Category ID",
      "City ID",
      "Published at",
      "Featured image filename",
      "Featured image URL",
      "Inline content image URLs",
      "Thumbnail",
    ];

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Blogs");
    worksheet.addRow(headers);

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF228B22" },
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };

    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: headers.length },
    };

    const thumbColIndex = headers.length - 1;
    let featuredImagesProcessed = 0;

    try {
      for (let rowIndex = 0; rowIndex < blogs.length; rowIndex++) {
        const b = blogs[rowIndex];
        const featuredFile = b.blogImage || "";
        const featuredUrl = featuredFile
          ? `${imageBase}blog/${featuredFile}`
          : "";
        const published = parseBlogDate(b.createdAt);
        const publishedStr = published
          ? published.toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "medium",
            })
          : "";

        const rowValues = [
          b.index ?? rowIndex + 1,
          b.id,
          b.blogTitle ?? "",
          b.blogKeywords ?? "",
          b.blogMetaDescription ?? "",
          b.blogDescription ?? "",
          b.slugUrl ?? "",
          b.blogCategory ?? "",
          b.cityName ?? "",
          b.status === 1 ? "Published" : "Draft",
          b.categoryId ?? "",
          b.cityId ?? "",
          publishedStr,
          featuredFile,
          featuredUrl,
          extractImgSrcsFromHtml(b.blogDescription || ""),
          "",
        ];

        worksheet.addRow(rowValues);

        if (featuredUrl) {
          try {
            const { base64, extension } = await fetchImageAsBase64(featuredUrl);
            const imageId = workbook.addImage({ base64, extension });
            worksheet.addImage(imageId, {
              tl: { col: thumbColIndex, row: rowIndex + 1 },
              ext: { width: 220, height: 120 },
            });
            worksheet.getRow(rowIndex + 2).height = 95;
          } catch {
            /* CORS or missing file — URL remains in sheet */
          }
          featuredImagesProcessed += 1;
          setExcelExportUi((prev) => ({
            ...prev,
            imageDone: featuredImagesProcessed,
          }));
        }
      }

      worksheet.columns.forEach((col, idx) => {
        if (idx === 5) {
          col.width = 50;
          return;
        }
        if (idx === thumbColIndex) {
          col.width = 32;
          return;
        }
        let maxLength = 12;
        col.eachCell({ includeEmpty: true }, (cell) => {
          const len = cell.value != null ? String(cell.value).length : 0;
          if (len > maxLength) maxLength = len;
        });
        col.width = Math.min(maxLength + 2, 45);
      });

      setExcelExportUi((prev) => ({ ...prev, step: "finalize" }));

      const timestamp = new Date()
        .toISOString()
        .replace(/[-:]/g, "")
        .replace("T", "_")
        .split(".")[0];
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `blogs_export_${timestamp}.xlsx`);
      setExcelExportUi((prev) => ({ ...prev, phase: "success" }));
    } catch {
      toast.error("Export failed. Please try again.");
      setExcelExportUi(EXCEL_EXPORT_UI_INITIAL);
    } finally {
      excelExportInProgressRef.current = false;
    }
  };

  //Defining table columns
  const columns = [
    { field: "index", headerName: "S.no", width: 50 },
    {
      field: "blogImage",
      headerName: "Blog Image",
      width: 120,
      renderCell: (params) => (
        <Image
          src={`${process.env.NEXT_PUBLIC_IMAGE_URL}blog/${params.row.blogImage}`}
          alt="Project"
          width={100}
          height={50}
          style={{ borderRadius: "5px" }}
        />
      ),
    },
    {
      field: "blogKeywords",
      headerName: "Keywords",
      width: 200,
    },
    { field: "blogTitle", headerName: "Title", width: 200 },
    {
      field: "blogMetaDescription",
      headerName: "Meta Description",
      width: 200,
    },
    { field: "blogDescription", headerName: "Description", width: 200 },
    { field: "slugUrl", headerName: "Url", width: 200 },
    {
      field: "createdAt",
      headerName: "Published",
      width: 190,
      renderCell: (params) => formatPublishedDateTime(params.row.createdAt),
    },
    { field: "blogCategory", headerName: "Category", width: 200 },
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params) => (
        <div>
          <FontAwesomeIcon
            className="mx-3 text-danger cursor-pointer"
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
  return (
    <>
      <Modal
        show={excelExportUi.open}
        centered
        backdrop="static"
        keyboard={false}
        contentClassName={exportOverlayStyles.overlayModal}
      >
        <Modal.Body
          className={exportOverlayStyles.body}
          role={excelExportUi.phase === "loading" ? "status" : undefined}
          aria-live={excelExportUi.phase === "loading" ? "polite" : undefined}
        >
          {excelExportUi.phase === "loading" && (
            <>
              <div className={exportOverlayStyles.spinnerWrap} aria-hidden>
                <div className={exportOverlayStyles.spinnerRing} />
                <div className={exportOverlayStyles.spinnerRingInner} />
              </div>
              {excelExportUi.step === "finalize" ? (
                <>
                  <p className={exportOverlayStyles.loadingTitle}>
                    Finalizing spreadsheet…
                  </p>
                  <p className={exportOverlayStyles.subtle}>
                    Almost ready — packing your Excel file.
                  </p>
                </>
              ) : excelExportUi.imageTotal > 0 ? (
                <>
                  <p className={exportOverlayStyles.loadingTitle}>
                    Image compression is going on please wait
                  </p>
                  <p className={exportOverlayStyles.counterLabel}>Progress</p>
                  <p className={exportOverlayStyles.counter}>
                    {excelExportUi.imageDone} / {excelExportUi.imageTotal}
                  </p>
                </>
              ) : (
                <>
                  <p className={exportOverlayStyles.loadingTitle}>
                    Preparing your Excel file…
                  </p>
                  <p className={exportOverlayStyles.subtle}>
                    No featured images to embed — building the sheet.
                  </p>
                </>
              )}
            </>
          )}
          {excelExportUi.phase === "success" && (
            <div className={exportOverlayStyles.successWrap}>
              <svg
                className={exportOverlayStyles.tickSvg}
                viewBox="0 0 52 52"
                aria-hidden
              >
                <circle
                  className={exportOverlayStyles.tickCircle}
                  cx="26"
                  cy="26"
                  r="24"
                />
                <path
                  className={exportOverlayStyles.tickPath}
                  d="M14 28l9 9 17-20"
                />
              </svg>
              <p className={exportOverlayStyles.successTitle}>
                Sheet is downloaded
              </p>
            </div>
          )}
        </Modal.Body>
      </Modal>
      <DashboardHeader
        buttonName={"+ Add Blog"}
        functionName={openAddModel}
        heading={"Manage Blogs"}
        exportExcel={"Export to Excel"}
        exportFunction={exportBlogsToExcel}
        exportDisabled={
          excelExportUi.open && excelExportUi.phase === "loading"
        }
      />
      <div className="table-container">
        <DataTable columns={columns} list={list} />
      </div>
      {/* Blog form */}
      <Modal
        size="xl"
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        enforceFocus={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Form.Group as={Col} md="6" controlId="blogTitle">
                <Form.Label>Meta Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Meta title"
                  name="blogTitle"
                  value={formData.blogTitle || ""}
                  onChange={handleChange}
                  required
                />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>
              <Form.Group as={Col} md="6" controlId="blogKeywords">
                <Form.Label>Blog Keywords</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Blog keywords"
                  name="blogKeywords"
                  value={formData.blogKeywords || ""}
                  onChange={handleChange}
                  required
                />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group controlId="blogDescription">
                <Form.Label>Blog Meta Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Blog meta description"
                  name="blogMetaDescription"
                  value={formData.blogMetaDescription || ""}
                  onChange={handleChange}
                  required
                />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col} md="6" controlId="blogCategory">
                <Form.Label>Blog category</Form.Label>
                <Form.Select
                  name="blogCategory"
                  value={formData.blogCategory || ""}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select category</option>
                  {categoryList.map((item, index) => (
                    <option key={index} value={item.id}>
                      {item.categoryName}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>
              <Form.Group as={Col} md="6" controlId="blogImage">
                <Form.Label>Blog Image</Form.Label>
                {previousBlogImage && (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_IMAGE_URL}blog/${previousBlogImage}`}
                    alt={"blog_image"}
                    className="img-fluid rounded shadow-sm mb-4"
                    width={300}
                    height={100}
                  />
                )}
                <Form.Control
                  type="file"
                  placeholder="Choose file"
                  name="blogImage"
                  onChange={handleChange}
                  // required
                />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>
            </Row>
            {isShowCityDropDown && (
              <Row className="mb-3">
                <Form.Group as={Col} md="6" controlId="blogCategory">
                  <Form.Label>Choose city</Form.Label>
                  <Form.Select
                    name="cityId"
                    value={formData.cityId || ""}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select city</option>
                    {cityList.map((item, index) => (
                      <option key={index} value={item.id}>
                        {item.cityName}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                </Form.Group>
              </Row>
            )}
            <Row className="mb-3">
              <Form.Group as={Col} md="6" controlId="slugUrl">
                <Form.Label>Slug Url</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Slug url"
                  name="slugUrl"
                  value={formData.slugUrl || ""}
                  onChange={handleChange}
                  required
                />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>
              <Form.Group as={Col} md="6" controlId="blogImage">
                <Form.Label>Blog Image</Form.Label>
                <br />
                <Button onClick={openImageUrlPopup}>Open Image urls</Button>
              </Form.Group>
            </Row>
            <Row className="mb-3">
              {/* <Form.Group className="mb-3" controlId="writeBlogDescription"> */}
              <Form.Label>Write blog description</Form.Label>
              {/* <JoditEditor
                                    ref={editor}
                                    value={blogDescription}
                                    onChange={(newcontent) => setBlogDescription(newcontent)}
                                /> */}
              <Editor value={blogDescription} onChange={setBlogDescription} />
              {/* </Form.Group> */}
            </Row>
            <Button
              className="btn btn-success"
              type="submit"
              disabled={showLoading}
            >
              {buttonName} <LoadingSpinner show={showLoading} />
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      <CommonModal
        confirmBox={confirmBox}
        setConfirmBox={setConfirmBox}
        api={`${process.env.NEXT_PUBLIC_API_URL}blog/${blogId}`}
      />
      <ImageUrlPopup confirmBox={urlPopUp} setConfirmBox={setUrlPopUp} />
    </>
  );
}
