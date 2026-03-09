"use client";
import { LoadingSpinner } from "@/app/_global_components/LoadingSpinner";
import axios from "axios";
import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { toast } from "react-toastify";
export default function AddNewProperty() {
  const [validated, setValidated] = useState(false);
  const [builderList, setBuilderList] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [amenityList, setAmenityList] = useState([]);
  const [projectTypeList, setProjectTypeList] = useState([]);
  const [showLoading, setShowLoading] = useState(false);
  const [formData, setFormData] = useState({
    projectName: "",
    projectLocality: "",
    projectLogo: "",
    projectThumbnail: "",
    projectPrice: "",
    cityLocation: "",
    state: "",
    country: "",
    amenityDesc: "",
    aboutDesc: "",
    walkthroughDesc: "",
    floorPlanDesc: "",
    locationDesc: "",
    locationMap: "",
    metaTitle: "",
    metaKeyword: "",
    metaDescription: "",
    amenities: "",
    projectBy: "",
    reraNo: "",
    propertyType: "",
    projectConfiguration: ""
  });
  const fetchBuilders = async () => {
    const builders = await axios.get(
      process.env.NEXT_PUBLIC_API_URL + "builder/get-all"
    );
    if (builders) {
      setBuilderList(builders.data.builders);
    }
  };
  const fetchAmenities = async () => {
    const builders = await axios.get(
      process.env.NEXT_PUBLIC_API_URL + "amenity/get-all"
    );
    if (builders) {
      setAmenityList(builders.data);
    }
  };
  const fetchProjectTypes = async () => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}project-types/get-all`);
    setProjectTypeList(response.data);
  }
  useEffect(() => {
  }, [selectedItems]);
  useEffect(() => {
    fetchBuilders();
    fetchAmenities();
    fetchProjectTypes();
  }, []);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({
      ...formData,
      [name]: files[0],
    });
  };
  //Handle submiting project
  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }
    if (form.checkValidity() === true) {
      setShowLoading(true);
      const data = new FormData();
      for (let key in formData) {
        data.append(key, formData[key]);
      }
      try {
        const response = await axios.post(
          process.env.NEXT_PUBLIC_API_URL + "properties/post",
          data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        if (response.data.isSuccess === 1) {
          toast.success(response.data.message);
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        toast.error(error);
      } finally {
        setShowLoading(false);
      }
    }
  };

  //Handle selecting items
  const handleItemSelect = (item) => {
    setSelectedItems((prevSelected) => {
      if (prevSelected.includes(item.id)) {
        // Deselect the item
        return prevSelected.filter((selectedItem) => selectedItem !== item.id);
      } else {
        // Select the item
        return [...prevSelected, item.id];
      }
    });
  };

  return (
    <div className="container-fluid">
      <h1 className="text-center">Add New Project</h1>
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Form.Group as={Col} md="4" controlId="validationCustom01">
            <Form.Label>Project name</Form.Label>
            <Form.Control
              required
              type="text"
              placeholder="Project name"
              name="projectName"
              value={formData.projectName}
              onChange={handleChange}
            />
            <Form.Control.Feedback type="invalid">
              Project name is required.
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group as={Col} md="4" controlId="validationCustom02">
            <Form.Label>Project Locality</Form.Label>
            <Form.Control
              required
              type="text"
              placeholder="Project Locality"
              name="projectLocality"
              value={formData.projectLocality}
              onChange={handleChange}
            />
            <Form.Control.Feedback type="invalid">
              Project Locality is required!
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group
            as={Col}
            md="4"
            controlId="validationCustomUsername"
            className="position-relative mb-3"
          >
            <Form.Label>Project Logo</Form.Label>
            <Form.Control
              type="file"
              required
              name="projectLogo"
              onChange={handleFileChange}
            // isInvalid={!!errors.file}
            />
            <Form.Control.Feedback type="invalid">
              Project logo is required!
            </Form.Control.Feedback>
          </Form.Group>
        </Row>
        <Row>
          <Form.Group
            as={Col}
            md="4"
            controlId="validationCustomUsername"
            className="position-relative mb-3"
          >
            <Form.Label>Project Banner</Form.Label>
            <Form.Control
              type="file"
              required
              name="projectThumbnail"
              onChange={handleFileChange}
            // isInvalid={!!errors.file}
            />
            <Form.Control.Feedback type="invalid">
              Project Banner is required!
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group as={Col} md="4" controlId="validationCustom01">
            <Form.Label>Price</Form.Label>
            <Form.Control
              required
              type="text"
              placeholder="Project price"
              name="projectPrice"
              value={formData.projectPrice}
              onChange={handleChange}
            />
            <Form.Control.Feedback type="invalid">
              Project Price is required!
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group
            as={Col}
            md="4"
            controlId="validationCustomUsername"
            className="position-relative mb-3"
          >
            <Form.Label>Project Location</Form.Label>
            <Form.Control
              type="file"
              required
              name="locationMap"
              onChange={handleFileChange}
            // isInvalid={!!errors.file}
            />
            <Form.Control.Feedback type="invalid">
              Project map is required!
            </Form.Control.Feedback>
          </Form.Group>
        </Row>
        <Row className="mb-3">
          <Form.Group as={Col} md="6" controlId="validationCustom03">
            <Form.Label>City</Form.Label>
            <Form.Control
              type="text"
              placeholder="City"
              name="cityLocation"
              value={formData.cityLocation}
              onChange={handleChange}
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide a valid city.
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group as={Col} md="3" controlId="validationCustom04">
            <Form.Label>State</Form.Label>
            <Form.Control
              type="text"
              placeholder="State"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide a valid state.
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group as={Col} md="3" controlId="validationCustom05">
            <Form.Label>Country</Form.Label>
            <Form.Control
              type="text"
              placeholder="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide a valid country.
            </Form.Control.Feedback>
          </Form.Group>
        </Row>
        <Row>
          <Form.Group
            as={Col}
            md="6"
            className="mb-3"
            controlId="exampleForm.ControlTextarea1"
          >
            <Form.Label>Amenity Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="amenityDesc"
              value={formData.amenityDesc}
              onChange={handleChange}
            />
            <Form.Control.Feedback type="invalid">
              required
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group
            as={Col}
            md="6"
            className="mb-3"
            controlId="exampleForm.ControlTextarea1"
          >
            <Form.Label>Floor Plan Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="floorPlanDesc"
              value={formData.floorPlanDesc}
              onChange={handleChange}
            />
          </Form.Group>
        </Row>
        <Row>
          <Form.Group
            as={Col}
            md="6"
            className="mb-3"
            controlId="exampleForm.ControlTextarea1"
          >
            <Form.Label>Location Descrition</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="locationDesc"
              value={formData.locationDesc}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group
            as={Col}
            md="6"
            className="mb-3"
            controlId="exampleForm.ControlTextarea1"
          >
            <Form.Label>Walkthrough Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="walkthroughDesc"
              value={formData.walkthroughDesc}
              onChange={handleChange}
            />
          </Form.Group>
        </Row>
        <Row>
          <Form.Group
            as={Col}
            md="12"
            className="mb-3"
            controlId="exampleForm.ControlTextarea1"
          >
            <Form.Label>About Project</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="aboutDesc"
              value={formData.aboutDesc}
              onChange={handleChange}
            />
          </Form.Group>
        </Row>
        {/* Selectable divs */}
        <Row>
          <Form.Label>Select Amenities</Form.Label>
          <Col md={12} className="mb-3">
            <div className="border selectable-items rounded-2 d-flex flex-wrap p-2">
              {amenityList.map((item) => (
                <div
                  key={item.id}
                  className={`selectable-item ${selectedItems.includes(item) ? "selected" : ""
                    } rounded-2 border mx-3 mt-2 p-2`}
                  style={{
                    cursor: "pointer",
                    backgroundColor: selectedItems.includes(item.id)
                      ? "#00A859"
                      : "#f1f1f1",
                  }}
                  onClick={() => handleItemSelect(item)}
                >
                  {item.title}
                </div>
              ))}
            </div>
          </Col>
        </Row>
        <Row className="mb-3">
          <Form.Group as={Col} md="4" controlId="validationCustom01">
            <Form.Label>Meta Title</Form.Label>
            <Form.Control
              required
              type="text"
              placeholder="Meta Title"
              name="metaTitle"
              value={formData.metaTitle}
              onChange={handleChange}
            />
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
          </Form.Group>
          <Form.Group as={Col} md="4" controlId="validationCustom01">
            <Form.Label>Project By</Form.Label>
            <Form.Select aria-label="Default select example" name="projectBy" onChange={handleChange}>
              <option>Select Builder</option>
              {builderList.map((item) => (
                <option
                  className="text-uppercase"
                  key={item.id}
                  value={item.id}
                >
                  {item.builderName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group as={Col} md="4" controlId="validationCustom01">
            <Form.Label>Rera Number</Form.Label>
            <Form.Control
              required
              type="text"
              placeholder="Reara no."
              name="reraNo"
              value={formData.reraNo}
              onChange={handleChange}
            />
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
          </Form.Group>
        </Row>
        <Row className="mb-3">
          <Form.Group as={Col} md="4" controlId="validationCustom01">
            <Form.Label>Project Type</Form.Label>
            <Form.Select aria-label="Default select example" name="propertyType" onChange={handleChange}>
              <option>Select Type</option>
              {projectTypeList.map((item) => (
                <option
                  className="text-uppercase"
                  key={item.id}
                  value={item.id}
                >
                  {item.projectTypeName}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
          </Form.Group>
          <Form.Group as={Col} md="4" controlId="validationCustom01">
            <Form.Label>Project Configuration</Form.Label>
            <Form.Control
              required
              type="text"
              placeholder="Project Configuration"
              name="projectConfiguration"
              value={formData.projectConfiguration}
              onChange={handleChange}
            />
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
          </Form.Group>
        </Row>
        <Form.Group
          as={Col}
          md="12"
          className="mb-3"
          controlId="exampleForm.ControlTextarea1"
        >
          <Form.Label>Meta Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="metaDescription"
            value={formData.metaDescription}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group
          as={Col}
          md="12"
          className="mb-3"
          controlId="exampleForm.ControlTextarea1"
        >
          <Form.Label>Meta Keyword</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="metaKeyword"
            value={formData.metaKeyword}
            onChange={handleChange}
          />
        </Form.Group>
        <Button className="btn btn-success" type="submit">Submit form <LoadingSpinner show={showLoading} /></Button>
      </Form>
    </div>
  );
}
