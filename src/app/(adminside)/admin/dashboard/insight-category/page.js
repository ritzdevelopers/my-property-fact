"use client";
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import CommonModal from "../common-model/common-model";
import { Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";

export default function InsightCategory() {
  // Defining states
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [buttonName, setButtonName] = useState("");
  const [validated, setValidated] = useState(null);
  const [allHeadersList, setAllHeadersList] = useState([]);
  const [headerId, setHeaderId] = useState(0);
  const [confirmBox, setConfirmBox] = useState(false);
  const [api, setApi] = useState(null);
  const [showLoading, setShowLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: 0,
    categoryDisplayName: "",
    category: "",
  });
  //Object for page content text
  const pageObject = {
    pageHeading: "Manage Insight Category",
    headingbuttonName: "+ Add new category",
  };

  //Handle chaning form value
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  //Handle model opening closing
  const openAddModel = () => {
    setButtonName("Add category");
    setTitle("Add new category");
    setValidated(false);
    setShowModal(true);
    setFormData({
      id: 0,
      headerDisplayName: "",
      prority: null,
      subHeader: "",
    });
  };

  //Handle Edit Model
  const openEditModel = async (item) => {
    setButtonName("Update category");
    setTitle("Edit new category");
    setValidated(false);
    setShowModal(true);
    setFormData({
      id: item.id,
      categoryDisplayName: item.categoryDisplayName,
      category: item.category,
    });
  };

  //Handle confirmation Box
  const openConfirmationBox = (id) => {
    setConfirmBox(true);
    setApi(`${process.env.NEXT_PUBLIC_API_URL}category/delete/${id}`);
  };

  //Handle form submit
  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
    } else {
      try {
        setShowLoading(true);
        if (headerId > 0) {
          formData.id = headerId;
        }
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}category/post`,
          formData
        );
        if (response.data.isSuccess === 1) {
          toast.success(response.data.message);
          setShowModal(false);
          fetchAllHeadersList();
        }
      } catch (error) {
        toast.error(error);
      }finally{
        setShowLoading(false);
      }
    }
    setValidated(true);
  };
  const fetchAllHeadersList = async () => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}category/get`
    );
    const res = response.data;
    const list = res.map((item, index) => ({
      ...item,
      index: index + 1,
    }));
    setAllHeadersList(list);
  };
  useEffect(() => {
    fetchAllHeadersList();
  }, []);
  //Defining table columns
  const columns = [
    { field: "index", headerName: "S.no", width: 100 },
    {
      field: "categoryDisplayName",
      headerName: "Category Display Name",
      width: 450,
    },
    { field: "category", headerName: "Category", width: 400 },
    {
      field: "action",
      headerName: "Action",
      width: 250,
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

  const paginationModel = { page: 0, pageSize: 10 };
  return (
    <div>
      <div className="d-flex justify-content-between mt-3">
        <p className="h1 ">{pageObject.pageHeading}</p>
        <Button className="mx-3 btn btn-success" onClick={() => openAddModel()}>
          {pageObject.headingbuttonName}
        </Button>
      </div>
      <div className="table-container">
        <Paper sx={{ height: 550, width: "100%" }}>
          <DataGrid
            rows={allHeadersList}
            columns={columns}
            initialState={{ pagination: { paginationModel } }}
            pageSizeOptions={[10, 15, 20, 50]}
            checkboxSelection
            sx={{
              border: 0,
              "& .MuiDataGrid-columnHeader": {
                fontWeight: "bold", // Make headings bold
                fontSize: "16px", // Optional: Adjust size
                backgroundColor: "#68ac78", // Optional: Light background
              },
            }}
          />
        </Paper>
      </div>
      {/* Modal for adding a new header */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="headerName">
              <Form.Label>Category Display Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter category display name"
                name="categoryDisplayName"
                onChange={(e) => handleChange(e)}
                value={formData.categoryDisplayName || ""}
                required
              />
              <Form.Control.Feedback type="invalid">
                Category Display name is required
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="subHeaderName">
              <Form.Label>Category</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter category"
                name="category"
                onChange={(e) => handleChange(e)}
                value={formData.category || ""}
              />
              <Form.Control.Feedback type="invalid">
                Category is required
              </Form.Control.Feedback>
            </Form.Group>
            {/* <Form.Group className="mb-3" controlId="priority">
              <Form.Label>Priority</Form.Label>
              <Form.Control type="text" name="prority" />
              <Form.Control.Feedback type="invalid">
                Priority is required
              </Form.Control.Feedback>
            </Form.Group> */}
            <Button className="btn btn-success" type="submit" disabled={showLoading}>
              {buttonName} <LoadingSpinner show={showLoading}/>
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      {/* Pass the necessary props to CommonModal */}
      <CommonModal
        confirmBox={confirmBox}
        setConfirmBox={setConfirmBox}
        api={api}
        fetchAllHeadersList={fetchAllHeadersList}
      />
    </div>
  );
}
