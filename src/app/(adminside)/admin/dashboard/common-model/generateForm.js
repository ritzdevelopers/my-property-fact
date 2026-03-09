import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button, Form, Modal } from "react-bootstrap";
import { toast } from "react-toastify";

export default function GenerateForm({ inputFields, showModal, setShowModal, validated, setValidated,
    setShowLoading, setButtonName, buttonName, showLoading, formData, title, setFormData, api
}) {
    const router = useRouter();
    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
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
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );
                if (response.data.isSuccess === 1) {
                    router.refresh();
                    setShowModal(false);
                    toast.success(response.data.message);
                } else {
                    toast.error(response.data.message);
                }
            } catch (error) {
                toast.error(error.response.data.error);
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
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
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