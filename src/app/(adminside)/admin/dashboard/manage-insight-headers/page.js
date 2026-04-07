"use client";
import axios from "axios";
import {
  AdminTableDeleteIcon,
  AdminTableEditIcon,
} from "../common-model/admin-table-icons";
import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import CommonModal from "../common-model/common-model";
import { Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { adminExecutiveDataGridSx } from "../common-model/data-table";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";

export default function CityHeaders() {
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
    headerDisplayName: "",
    prority: null,
    subHeader: "",
  });
  //Object for page content text
  const pageObject = {
    pageHeading: "Manage Insight Headers",
    headingbuttonName: "+ Add new header",
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
    setButtonName("Add header");
    setTitle("Add new header");
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
    setButtonName("Update header");
    setTitle("Edit new header");
    setValidated(false);
    setShowModal(true);
    setFormData({
      id: item.id,
      headerDisplayName: item.headerDisplayName,
      subHeader: item.subHeader,
    });
  };

  //Handle confirmation Box
  const openConfirmationBox = (id) => {
    setConfirmBox(true);
    setApi(`${process.env.NEXT_PUBLIC_API_URL}headers/delete/${id}`);
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
          `${process.env.NEXT_PUBLIC_API_URL}headers/post`,
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
      `${process.env.NEXT_PUBLIC_API_URL}headers/get`
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
      field: "headerDisplayName",
      headerName: "Header Display Name",
      width: 350,
    },
    { field: "priority", headerName: "Priority", width: 200 },
    {
      field: "subHeader",
      headerName: "Sub Header",
      width: 350,
    },
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params) => (
        <div className="d-flex align-items-center gap-2">
          <span
            className="d-inline-flex"
            style={{ cursor: "pointer" }}
            onClick={() => openConfirmationBox(params.row.id)}
            role="presentation"
          >
            <AdminTableDeleteIcon />
          </span>
          <span
            className="d-inline-flex"
            style={{ cursor: "pointer" }}
            onClick={() => openEditModel(params.row)}
            role="presentation"
          >
            <AdminTableEditIcon />
          </span>
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
      <div className="admin-datagrid-scroll-host admin-datagrid-scroll-host--executive table-container mt-5">
        <Paper
          className="admin-mui-datagrid-paper"
          elevation={0}
          sx={{ height: 550, width: "100%", borderRadius: "16px" }}
        >
          <DataGrid
            rows={allHeadersList}
            columns={columns}
            initialState={{ pagination: { paginationModel } }}
            pageSizeOptions={[10, 15, 20, 50]}
            checkboxSelection
            disableColumnMenu
            disableRowSelectionOnClick
            sx={adminExecutiveDataGridSx}
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
              <Form.Label>Header Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter header name"
                name="headerDisplayName"
                onChange={(e) => handleChange(e)}
                value={formData.headerDisplayName || ""}
                required
              />
              <Form.Control.Feedback type="invalid">
                Header name is required
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="subHeaderName">
              <Form.Label>Sub header name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter sub header name"
                name="subHeader"
                onChange={(e) => handleChange(e)}
                value={formData.subHeader || ""}
              />
              <Form.Control.Feedback type="invalid">
                Sub header name is required
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
