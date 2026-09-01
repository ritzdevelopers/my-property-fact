import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import axios from "axios";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { adminApiWithAuth, adminFetchHeaders } from "../../_lib/adminApiAuth";
import { toast } from "../../_lib/adminToast";

const Editor = dynamic(() => import("./joe-editor"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

export default function GenerateForm({ inputFields, showModal, setShowModal, validated, setValidated,
    setShowLoading, setButtonName, buttonName, showLoading, formData, title, setFormData, api
}) {
    const router = useRouter();
    const [editorErrors, setEditorErrors] = useState({});
    const hasEditorField = inputFields.some((item) => item.type === "editor");

    const normalizeEditorHtml = (value) => {
        const raw = String(value || "").trim();
        if (!raw) return "";
        const withoutTags = raw
            .replace(/<br\s*\/?>/gi, "")
            .replace(/&nbsp;/gi, " ")
            .replace(/<[^>]*>/g, "")
            .trim();
        return withoutTags;
    };

    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const nextEditorErrors = {};
        inputFields
            .filter((item) => item.type === "editor" && item.required !== false)
            .forEach((item) => {
                if (!normalizeEditorHtml(formData[item.id])) {
                    nextEditorErrors[item.id] = `${item.label} is required !`;
                }
            });
        setEditorErrors(nextEditorErrors);
        if (Object.keys(nextEditorErrors).length > 0) {
            setValidated(true);
            return;
        }
        if (form.checkValidity() === false) {
            e.stopPropagation();
        } else {
            try {
                setButtonName("");
                setShowLoading(true);
                const payload = {
                    ...formData,
                    id: formData.id || 0
                }                
                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}${api}`,
                    payload,
                    {
                        ...adminApiWithAuth(),
                        headers: adminFetchHeaders({ "Content-Type": "application/json" }),
                    }
                );
                if (response.data.isSuccess === 1) {
                    router.refresh();
                    setShowModal(false);
                    setEditorErrors({});
                    toast.success(response.data.message);
                } else {
                    toast.error(response.data.message);
                }
            } catch (error) {
                const d = error.response?.data;
                const msg =
                    (typeof d === "string" ? d : null) ||
                    d?.message ||
                    d?.error ||
                    error.message ||
                    "Request failed";
                toast.error(msg);
            } finally {
                setButtonName(buttonName);
                setShowLoading(false);
            }
        }
        setValidated(true);
    };

    //Handling the input fields chnage
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    }

    return (
        <Modal
            show={showModal}
            onHide={() => setShowModal(false)}
            centered
            scrollable={hasEditorField}
            size={hasEditorField ? "xl" : undefined}
        >
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    {inputFields.map((item, index) => (
                        <div key={index}>
                            {item.type === "text" || item.type === "number" ?
                                <Form.Group key={`${item.id}-${index}`} className="mb-3" controlId={item.id}>
                                    <Form.Label>{item.label}</Form.Label>
                                    <Form.Control
                                        type={item.type}
                                        placeholder={`Enter ${item.label}`}
                                        value={formData[item.id] || ""}
                                        onChange={handleChange}
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {`${item.label} is required !`}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                :
                                (item.type === "select" ? <Form.Group key={`${item.id}-${index}`} className="mb-3" controlId={item.id}>
                                    <Form.Label>{item.label}</Form.Label>
                                    <Form.Select
                                        name={item.id}
                                        value={formData[item.id] || ""}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select {item.label}</option>
                                        {item.list?.map((option, idx) => (
                                            <option key={idx} value={option.id}>
                                                {item.from === "localities" ? option.name : option.stateName}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        {`${item.label} is required!`}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                    :
                                    (item.type === "editor" ? (
                                        <Form.Group key={`${item.id}-${index}`} className="mb-3" controlId={item.id}>
                                            <Form.Label>{item.label}</Form.Label>
                                            <Editor
                                                value={formData[item.id] || ""}
                                                onChange={(value) =>
                                                    setFormData((prev) => ({ ...prev, [item.id]: value }))
                                                }
                                            />
                                            {editorErrors[item.id] ? (
                                                <div className="text-danger mt-1" style={{ fontSize: "0.875rem" }}>
                                                    {editorErrors[item.id]}
                                                </div>
                                            ) : null}
                                        </Form.Group>
                                    ) : (
                                        <Form.Group key={`${item.id}-${index}`} className="mb-3" controlId={item.id}>
                                            <Form.Label>{item.label}</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                placeholder={`Enter ${item.label}`}
                                                value={formData[item.id] || ""}
                                                onChange={handleChange}
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {`${item.label} is required !`}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    ))
                                )
                            }
                        </div>
                    ))}
                    <Button className="btn btn-success" type="submit" disabled={showLoading}>
                        {buttonName}<LoadingSpinner show={showLoading} />
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    )
}