"use client";
import { LoadingSpinner } from "@/app/(home)/contact-us/page";
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button, Form, FormControl, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import CommonModal from "../common-model/common-model";
import DataTable from "../common-model/data-table";
import DashboardHeader from "../common-model/dashboardHeader";
import { useRouter } from "next/navigation";
export default function ManageBanners({ list, config = {} }) {
    const router = useRouter();
    const addButtonLabel = config.addButtonLabel || "+ Add Project Banner";
    const headingLabel = config.headingLabel || "Manage Project Banners";
    const showTabletBannerColumn = Boolean(config.showTabletBannerColumn);
    const showProjectSelect = config.showProjectSelect !== false;
    const showProjectNameColumn = config.showProjectNameColumn !== false;
    const showAltTag = config.showAltTag !== false;
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState(null);
    const [buttonName, setButtonName] = useState(null);
    const [validated, setValidated] = useState(false);
    const [altTag, setAltTag] = useState(null);
    const [projectId, setProjectId] = useState(0);
    const [projectList, setProjectList] = useState([]);
    const [bannerId, setBannerId] = useState(0);
    const [showLoading, setShowLoading] = useState(false);
    const [confirmBox, setConfirmBox] = useState(false);
    const [mobileBannerImages, setMobileBannerImages] = useState([]);
    const [tabletBannerImages, setTabletBannerImages] = useState([]);
    const [desktopBannerImages, setDesktopBannerImages] = useState([]);
    const [deletedMobileImageIds, setDeletedMobileImageIds] = useState([]);
    const [deletedTabletImageIds, setDeletedTabletImageIds] = useState([]);
    const [deletedDesktopImageIds, setDeletedDesktopImageIds] = useState([]);
    const [imagePopUp, setImagePopUp] = useState(false);
    const [popUpImageSrc, setPopUpImageSrc] = useState(null);
    const [isEditBanner, setIsEditBanner] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
            return;
        }
        if (form.checkValidity() === true) {
            setShowLoading(true);
            setButtonName("");
            if (showProjectSelect) {
                formData.append("projectId", projectId);
            }
            if (showAltTag) {
                formData.append("altTag", altTag);
            }
            formData.append("deletedMobileImageIds", deletedMobileImageIds);
            formData.append("deletedTabletImageIds", deletedTabletImageIds);
            formData.append("deletedDesktopImageIds", deletedDesktopImageIds);
            mobileBannerImages
                .filter(img => img.file)
                .forEach(img => {
                    if (img && typeof img.file.name === "string" && img.file.size && img.file.type) {
                        formData.append("projectMobileBannerImageList", img.file);
                    }
                });
            tabletBannerImages
                .filter(img => img.file)
                .forEach(img => {
                    if (img && typeof img.file.name === "string" && img.file.size && img.file.type) {
                        formData.append("projectTabletBannerImageList", img.file);
                    }
                });
            desktopBannerImages
                .filter(img => img.file)
                .forEach(img => {
                    if (img && typeof img.file.name === "string" && img.file.size && img.file.type) {
                        formData.append("projectDesktopBannerImageList", img.file);
                    }
                });
            try {
                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}project-banner/add-banner`,
                    formData,
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
                } else {
                    toast.error(response.data.message);
                }
            } catch (error) {
                console.error("Error uploading file:", error);
                toast.error(error.response?.data?.message || "An error occurred while uploading the banner.");
            } finally {
                setShowLoading(false);
                setButtonName("Add");
            }
        }
    };

    const openAddBanner = () => {
        setValidated(false);
        setShowModal(true);
        setTitle("Add Banner");
        setAltTag("");
        setProjectId(0);
        setButtonName("Add");
        setMobileBannerImages([]);
        setTabletBannerImages([]);
        setDesktopBannerImages([]);
        setDeletedMobileImageIds([]);
        setDeletedTabletImageIds([]);
        setDeletedDesktopImageIds([]);
        setIsEditBanner(false);
        setProjectList(showProjectSelect ? list.filter(item => item.projectBannerList.length === 0) : []);
    };

    const openEditModel = (item) => {
        // Bind existing mobile images
        const formattedMobileBanners = item.projectMobileBannerDtoList.map((img) => ({
            id: img.id,
            preview: `${process.env.NEXT_PUBLIC_IMAGE_URL}properties/${item.slugURL}/${img.mobileImage}`,
            isNew: false
        }));
        setMobileBannerImages(formattedMobileBanners);
        const existingTabletList = getTabletBannerList(item);
        const formattedTabletBanners = existingTabletList
            .map((img) => {
                const imageName = img.tabletImage || img.image || img.bannerImage;
                if (!imageName) return null;
                return {
                    id: img.id,
                    preview: `${process.env.NEXT_PUBLIC_IMAGE_URL}properties/${item.slugURL}/${imageName}`,
                    isNew: false,
                };
            })
            .filter(Boolean);
        setTabletBannerImages(formattedTabletBanners);
        // Bind existing desktop images
        const formattedDesktopBanners = item.projectDesktopBannerDtoList.map((img) => ({
            id: img.id,
            preview: `${process.env.NEXT_PUBLIC_IMAGE_URL}properties/${item.slugURL}/${img.desktopImage}`,
            isNew: false
        }));
        setDesktopBannerImages(formattedDesktopBanners);
        setShowModal(true);
        setTitle("Edit Banner");
        item.projectBannerList.map(image => {
            setAltTag(image.altTag);
        })
        setProjectId(item.id);
        setButtonName("Update");
        setIsEditBanner(true);
        setProjectList(list);
    };

    // Handle file change
    const handleMobileBannerFileChange = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setMobileBannerImages((prev) => [...prev, ...newImages]);
    };

    // Handle file change
    const handleDesktopBannerFileChange = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setDesktopBannerImages((prev) => [...prev, ...newImages]);
    };

    const handleTabletBannerFileChange = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setTabletBannerImages((prev) => [...prev, ...newImages]);
    };

    //Handling deletion of banner
    const openConfirmationBox = (id) => {
        setConfirmBox(true);
        setBannerId(id);
    }

    const getTabletBannerList = (row) => {
        if (Array.isArray(row?.projectTabletBannerDtoList)) {
            return row.projectTabletBannerDtoList;
        }
        if (Array.isArray(row?.tabletBannerDtoList)) {
            return row.tabletBannerDtoList;
        }
        return [];
    };
    //Defining table columns
    const columns = [
        { field: "index", headerName: "S.no", width: 100 },
        ...(showProjectNameColumn
            ? [{ field: "projectName", headerName: "Project Name", flex: 1 }]
            : []),
        {
            field: "mobileBanner",
            headerName: "Mobile Banner",
            flex: 1,
            renderCell: (params) => (
                <>
                    {
                        params.row.projectMobileBannerDtoList.map((item, index) => (
                            <Image
                                key={index}
                                src={`${process.env.NEXT_PUBLIC_IMAGE_URL}properties/${item.slugURL}/${item.mobileImage}`}
                                alt={item.mobileAltTag || "Project Mobile Banner"}
                                width={50}
                                height={50}
                                className="rounded-2 mx-1"
                            />
                        ))
                    }
                </>
            ),
        },
        {
            field: "desktopBanner",
            headerName: "Desktop Banner",
            flex: 1,
            renderCell: (params) => (
                <>
                    {
                        params.row.projectDesktopBannerDtoList.map((item, index) => (
                            <Image
                                key={index}
                                src={`${process.env.NEXT_PUBLIC_IMAGE_URL}properties/${item.slugURL}/${item.desktopImage}`}
                                alt={item.desktopAltTag || "Project Desktop Banner"}
                                width={150}
                                height={50}
                                className="rounded-2 mx-1"
                            />
                        ))}
                </>
            ),
        },
        ...(showTabletBannerColumn
            ? [
                {
                    field: "tabletBanner",
                    headerName: "Tablet Banner",
                    flex: 1,
                    renderCell: (params) => (
                        <>
                            {getTabletBannerList(params.row).map((item, index) => {
                                const slug = item.slugURL || params.row?.slugURL;
                                const imageName = item.tabletImage || item.image || item.bannerImage;
                                if (!slug || !imageName) return null;
                                return (
                                    <Image
                                        key={index}
                                        src={`${process.env.NEXT_PUBLIC_IMAGE_URL}properties/${slug}/${imageName}`}
                                        alt={item.tabletAltTag || item.altTag || "Home Tablet Banner"}
                                        width={120}
                                        height={50}
                                        className="rounded-2 mx-1"
                                    />
                                );
                            })}
                        </>
                    ),
                },
            ]
            : []),
        ...(showAltTag
            ? [
                {
                    field: "altTag",
                    headerName: "Alt Tag",
                    flex: 1,
                    renderCell: (params) => (
                        <div>
                            {params.row.projectBannerList
                                ?.map(image => image.altTag)
                                .join(", ")}
                        </div>
                    ),
                },
            ]
            : []),
        {
            field: "action",
            headerName: "Action",
            width: 100,
            renderCell: (params) => (
                <div className="d-flex gap-3 mt-3">
                    <FontAwesomeIcon
                        className="text-warning"
                        style={{ cursor: "pointer" }}
                        icon={faPencil}
                        onClick={() => openEditModel(params.row)}
                    />
                    <FontAwesomeIcon
                        className="text-danger"
                        style={{ cursor: "pointer" }}
                        icon={faTrash}
                        onClick={() => openConfirmationBox(params.row.id)}
                    />
                </div>
            ),
        },
    ];

    const removeImage = (index) => {
        setMobileBannerImages((prev) => {
            const updated = [...prev];
            const removed = updated.splice(index, 1)[0];
            if (removed.isNew === false) {
                setDeletedMobileImageIds((prevIds) => {
                    if (!prevIds.includes(removed.id)) {
                        return [...prevIds, removed.id];
                    }
                    return prevIds;
                });
            }
            return updated;
        });
    };

    const removeDesktopImage = (index) => {
        setDesktopBannerImages((prev) => {
            const updated = [...prev];
            const removed = updated.splice(index, 1)[0];
            if (removed.isNew === false) {
                setDeletedDesktopImageIds((prevIds) => {
                    if (!prevIds.includes(removed.id)) {
                        return [...prevIds, removed.id];
                    }
                    return prevIds;
                });
            }
            return updated;
        });
    };

    const removeTabletImage = (index) => {
        setTabletBannerImages((prev) => {
            const updated = [...prev];
            const removed = updated.splice(index, 1)[0];
            if (removed.isNew === false) {
                setDeletedTabletImageIds((prevIds) => {
                    if (!prevIds.includes(removed.id)) {
                        return [...prevIds, removed.id];
                    }
                    return prevIds;
                });
            }
            return updated;
        });
    };

    //Opening image popup to view image
    const openImagePopUp = (src) => {
        setPopUpImageSrc(src);
        setImagePopUp(true);
    };
    return (
        <div>
            <div className="conatiner">
                <DashboardHeader
                    buttonName={addButtonLabel}
                    functionName={openAddBanner}
                    heading={headingLabel}
                />
                <div className="table-container">
                    <DataTable columns={columns} list={list.filter(item => (item.projectDesktopBannerDtoList.length > 0) || (item.projectMobileBannerDtoList.length > 0))} />
                </div>
            </div>
            {/* form for adding banner for project  */}
            <Modal size="lg" show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form noValidate validated={validated} onSubmit={handleSubmit}>
                        {showProjectSelect && (
                            <Form.Group className="fw-bold mb-3" md="4" controlId="selectProjectForBanner">
                                <Form.Label>Select Project</Form.Label>
                                <Form.Select
                                    aria-label="Default select example"
                                    onChange={(e) => setProjectId(e.target.value)}
                                    value={projectId}
                                    required
                                    disabled={isEditBanner}
                                >
                                    <option value="">Select Project</option>
                                    {projectList.map((item) => (
                                        <option
                                            className="text-uppercase"
                                            key={item.id}
                                            value={item.id}
                                        >
                                            {item.projectName}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    Project is required !
                                </Form.Control.Feedback>
                            </Form.Group>
                        )}
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Select Mobile Banner</Form.Label>
                            {/* Container */}
                            <div className="p-3 border rounded" style={{ minHeight: "120px" }}>
                                {mobileBannerImages.length > 0 ? (
                                    <div className="d-flex flex-wrap gap-3">
                                        {mobileBannerImages.map((img, index) => (
                                            <div key={index} style={{ position: "relative" }}>
                                                <Image
                                                    className="rounded-2 d-block my-2"
                                                    src={img.preview}
                                                    alt="preview"
                                                    width={100}
                                                    height={100}
                                                    
                                                    onClick={() => openImagePopUp(img.preview)}
                                                />
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    style={{
                                                        position: "absolute",
                                                        top: "-8px",
                                                        right: "-8px",
                                                        borderRadius: "50%",
                                                        padding: "0px 6px",
                                                    }}
                                                    onClick={() => removeImage(index)}
                                                >
                                                    ×
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted">No images selected</p>
                                )}
                            </div>

                            {/* Add More Button */}
                            <div className="mt-2">
                                <Form.Control
                                    type="file"
                                    multiple
                                    onChange={handleMobileBannerFileChange}
                                    style={{ display: "none" }}
                                    id="mobileImageUploadInput"
                                />
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() =>
                                        document.getElementById("mobileImageUploadInput").click()
                                    }
                                >
                                    + Add More Images
                                </Button>
                            </div>
                            <Form.Control.Feedback type="invalid">
                                Project mobile banner is required !
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Select Desktop banner</Form.Label>
                            {/* Container */}
                            <div className="p-3 border rounded" style={{ minHeight: "120px" }}>
                                {desktopBannerImages.length > 0 ? (
                                    <div className="d-flex flex-wrap gap-3">
                                        {desktopBannerImages.map((img, index) => (
                                            <div key={index} style={{ position: "relative" }}>
                                                <Image
                                                    className="rounded-2 d-block my-2"
                                                    src={img.preview}
                                                    alt="preview"
                                                    width={200}
                                                    height={100}
                                                    
                                                    onClick={() => openImagePopUp(img.preview)}
                                                />
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    style={{
                                                        position: "absolute",
                                                        top: "-8px",
                                                        right: "-8px",
                                                        borderRadius: "50%",
                                                        padding: "0px 6px",
                                                    }}
                                                    onClick={() => removeDesktopImage(index)}
                                                >
                                                    ×
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted">No images selected</p>
                                )}
                            </div>

                            {/* Add More Button */}
                            <div className="mt-2">
                                <Form.Control
                                    type="file"
                                    multiple
                                    onChange={handleDesktopBannerFileChange}
                                    style={{ display: "none" }}
                                    id="desktopImageUploadInput"
                                />
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() =>
                                        document.getElementById("desktopImageUploadInput").click()
                                    }
                                >
                                    + Add More Images
                                </Button>
                            </div>
                            <Form.Control.Feedback type="invalid">
                                Project desktop banner is required !
                            </Form.Control.Feedback>
                        </Form.Group>
                        {showTabletBannerColumn && (
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Select Tablet Banner</Form.Label>
                                <div className="p-3 border rounded" style={{ minHeight: "120px" }}>
                                    {tabletBannerImages.length > 0 ? (
                                        <div className="d-flex flex-wrap gap-3">
                                            {tabletBannerImages.map((img, index) => (
                                                <div key={index} style={{ position: "relative" }}>
                                                    <Image
                                                        className="rounded-2 d-block my-2"
                                                        src={img.preview}
                                                        alt="preview"
                                                        width={160}
                                                        height={90}
                                                        onClick={() => openImagePopUp(img.preview)}
                                                    />
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        style={{
                                                            position: "absolute",
                                                            top: "-8px",
                                                            right: "-8px",
                                                            borderRadius: "50%",
                                                            padding: "0px 6px",
                                                        }}
                                                        onClick={() => removeTabletImage(index)}
                                                    >
                                                        ×
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted">No images selected</p>
                                    )}
                                </div>

                                <div className="mt-2">
                                    <Form.Control
                                        type="file"
                                        multiple
                                        onChange={handleTabletBannerFileChange}
                                        style={{ display: "none" }}
                                        id="tabletImageUploadInput"
                                    />
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() =>
                                            document.getElementById("tabletImageUploadInput").click()
                                        }
                                    >
                                        + Add More Images
                                    </Button>
                                </div>
                                <Form.Control.Feedback type="invalid">
                                    Tablet banner is required !
                                </Form.Control.Feedback>
                            </Form.Group>
                        )}
                        {showAltTag && (
                            <Form.Group md="4" controlId="projectBannerAltTag"
                                className="fw-bold">
                                <Form.Label>Alt Tag</Form.Label>
                                <FormControl
                                    placeholder="Alt Tag"
                                    type="text"
                                    value={altTag || ""}
                                    onChange={(e) => setAltTag(e.target.value)}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    Alt tag is required !
                                </Form.Control.Feedback>
                            </Form.Group>
                        )}
                        <Button className="mt-3 btn btn-success" type="submit" disabled={showLoading}>
                            {buttonName} <LoadingSpinner show={showLoading} />
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
            <CommonModal
                confirmBox={confirmBox}
                setConfirmBox={setConfirmBox}
                api={`${process.env.NEXT_PUBLIC_API_URL}project-banner/delete/${bannerId}`}
            />
            <Modal
                size="lg"
                show={imagePopUp}
                onHide={() => setImagePopUp(false)}
                centered
            >
                <Modal.Body>
                    {popUpImageSrc && (
                        <Image
                            className="rounded-2"
                            src={popUpImageSrc}
                            alt="pop-up-image"
                            width={0}
                            height={0}
                            sizes="100vw"
                            style={{
                                height: "auto",
                                width: "auto",
                                maxWidth: "100%",
                                maxHeight: "80vh",
                            }}
                            
                        />
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
}
