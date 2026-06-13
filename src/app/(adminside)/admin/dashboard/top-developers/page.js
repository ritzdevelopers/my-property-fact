"use client";
import { Paper } from "@mui/material";
import {
  AdminTableDeleteIcon,
  AdminTableEditIcon,
} from "../common-model/admin-table-icons";
import { DataGrid } from "@mui/x-data-grid";
import { adminExecutiveDataGridSx } from "../common-model/data-table";
import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Col, Form, Modal, Row, Table } from "react-bootstrap";
import { toast } from "../../_lib/adminToast";

export default function TopDevelopers() {
  const [topDevelopersList, setTopDevelopersList] = useState([]);
  const [showModel, setShowModel] = useState(false);
  const [title, setTitle] = useState("");
  const [validated, setValidated] = useState(false);
  const [buttonName, setButtonName] = useState("");
  const [category, setCategory] = useState([]);
  const [aggregationFrom, setAggregationFrom] = useState([]);
  const [formData, setFormData] = useState({
    developerName: "",
    noOfTransactions: "",
    saleRentValue: "",
    aggregationFrom: 0,
    categoryId: 0,
  });
  // Fetch all developers data
  const fetchDevelopersData = async () => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}top-developers-by-value/get-all`
    );
    const res = response.data;    
    const list = res.map((item, index) => ({
      ...item,
      index: index + 1,
    }));
    setTopDevelopersList(list);
  };
  const fetchAllCategories = async () => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}category/get`
    );
    if (response) {
      setCategory(response.data);
    }
  };
  const fetchAllAggigationFrom = async () => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}aggregationFrom/get`
    );
    if (response) {
      setAggregationFrom(response.data);
    }
  };
  //Handle changing form data value
  const onChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  // Handle submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}top-developers-by-value/post`,
      formData
    );
    if (response.data.isSuccess === 1) {
      toast.success(response.data.message);
      setShowModel(false);
      fetchDevelopersData();
    }
  };
  // Handle opeing add model
  const openAddModel = () => {
    setShowModel(true);
    setTitle("Add new data");
    setButtonName("Add Data");
    setValidated(false);
    setFormData(formData);
  };

  // Call all functions on render
  useEffect(() => {
    fetchDevelopersData();
    fetchAllCategories();
    fetchAllAggigationFrom();
  }, []);
  //Defining table columns
  const columns = [
    { field: "index", headerName: "S.no", width: 100 },
    {
      field: "developerName",
      headerName: "Developer Name",
      width: 350,
    },
    { field: "noOfTransactions", headerName: "No Of Transactions", width: 200 },
    {
      field: "saleRentValue",
      headerName: "Sale Rent Value",
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
            onClick={() => openAddModel(params.row)}
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
    <>
      <div className="d-flex justify-content-between mt-3">
        <p className="h1 ">Manage Developers Data</p>
        <Button className="mx-3 btn btn-success" onClick={() => openAddModel()}>
          + Add new data
        </Button>
      </div>
      <div className="admin-datagrid-scroll-host admin-datagrid-scroll-host--executive table-container mt-5">
        <Paper
          className="admin-mui-datagrid-paper"
          elevation={0}
          sx={{ height: 550, width: "100%", borderRadius: "16px" }}
        >
          <DataGrid
            rows={topDevelopersList}
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
      <Modal show={showModel} onHide={() => setShowModel(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formCityName">
              <Form.Label>Developer Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Developer Name"
                name="developerName"
                value={formData.developerName}
                onChange={(e) => onChange(e)}
                required
              />
              <Form.Control.Feedback type="invalid">
                Developer Name is required
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="transactions">
              <Form.Label>Transactions</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Transactions"
                name="noOfTransactions"
                onChange={(e) => onChange(e)}
                value={formData.noOfTransactions}
                required
              />
              <Form.Control.Feedback type="invalid">
                Transactions is required
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formsalevalue">
              <Form.Label>Sale Value</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Sale Value"
                name="saleRentValue"
                onChange={(e) => onChange(e)}
                value={formData.saleRentValue}
                required
              />
              <Form.Control.Feedback type="invalid">
                Sale Value is required
              </Form.Control.Feedback>
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group
                  md="4"
                  className="mb-3"
                  controlId="price-data-category"
                >
                  <Form.Label>Select Category</Form.Label>
                  <Form.Select
                    aria-label="Default select example"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={onChange}
                    required
                  >
                    <option value="">Select category</option>
                    {category.map((item) => (
                      <option
                        className="text-uppercase"
                        key={item.id}
                        value={item.id}
                      >
                        {item.category}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Category is required
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group
                  md="4"
                  className="mb-3"
                  controlId="price-data-aggregation-from"
                >
                  <Form.Label>Select Aggregation From</Form.Label>
                  <Form.Select
                    aria-label="Default select example"
                    name="aggregationFrom"
                    value={formData.aggregationFrom || ""}
                    onChange={onChange}
                    required
                  >
                    <option value="">Select aggregationFrom</option>
                    {aggregationFrom.map((item) => (
                      <option
                        className="text-uppercase"
                        key={item.id}
                        value={item.id}
                      >
                        {item.aggregationFrom}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Aggregation From is required
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Button className="m-2 btn btn-success" type="submit">
              {buttonName}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}
