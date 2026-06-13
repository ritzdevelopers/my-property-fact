"use client";
import { Button, Form, FormControl, Modal } from "react-bootstrap";
import DashboardHeader from "../common-model/dashboardHeader";
import { useState } from "react";
import axios from "axios";
import { toast } from "../../_lib/adminToast";
import DataTable from "../common-model/data-table";

export default function ManageScoreEvalution({ localityList, list }) {
  const [localityId, setLocalityId] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [validated, setValidated] = useState(false);
  const [point, setPoint] = useState("");
  const [pointsList, setPointsList] = useState([]);
  const [localEconomyScore, setLocalEconomyScore] = useState("");
  const [localEconomyPoint, setLocalEconomyPoint] = useState("");
  const [onGoingFutureProjectsScore, setOnGoingFutureProjectsScore] =
    useState("");
  const [onGoingFutureProjectsPoint, setOnGoingFutureProjectsPoint] =
    useState("");
  const [connectivityAndCommuteScore, setConnectivityAndCommuteScore] =
    useState("");
  const [connectivityAndCommutePoint, setConnectivityAndCommutePoint] =
    useState("");
  const [amenitiesAndGentrificationScore, setAmenitiesAndGentrificationScore] =
    useState("");
  const [amenitiesAndGentrificationPoint, setAmenitiesAndGentrificationPoint] =
    useState("");
  const [trendsAndHostoricalDataScore, setTrendsAndHostoricalDataScore] =
    useState("");
  const [trendsAndHostoricalDataPoint, setTrendsAndHostoricalDataPoint] =
    useState("");
  const [exestingSupplyScore, setExestingSupplyScore] = useState("");
  const [exestingSupplyPoint, setExestingSupplyPoint] = useState("");
  const [interpretationAndOutlook, setInterpretationAndOutlook] = useState("");
  const [recommendationsForInvestors, setRecommendationsForInvestors] =
    useState("");
  const [localEconomyList, setLocalEconomyList] = useState([]);
  const [onGoingFutureProjectsList, setOnGoingFutureProjectsList] = useState(
    []
  );
  const [connectivityAndCommuteList, setConnectivityAndCommuteList] = useState(
    []
  );
  const [amenitiesAndGentrificationList, setAmenitiesAndGentrificationList] =
    useState([]);
  const [trendsAndHostoricalDataList, setTrendsAndHostoricalDataList] =
    useState([]);
  const [exestingSupplyList, setExestingSupplyList] = useState([]);
  const [interpretationAndOutlookList, setInterpretationAndOutlookList] =
    useState([]);
  const [recommendationsForInvestorsList, setRecommendationsForInvestorsList] =
    useState([]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    if (form.checkValidity() === true) {
      const locateObj = {
        localityId: localityId,
        localEconomyList: localEconomyList,
        localEconomyScore: localEconomyScore,
        onGoingFutureProjectsList: onGoingFutureProjectsList,
        onGoingFutureProjectsScore: onGoingFutureProjectsScore,
        connectivityAndCommuteList: connectivityAndCommuteList,
        connectivityAndCommuteScore: connectivityAndCommuteScore,
        amenitiesAndGentrificationList: amenitiesAndGentrificationList,
        amenitiesAndGentrificationScore: amenitiesAndGentrificationScore,
        trendsAndHistoricalDataList: trendsAndHostoricalDataList,
        trendsAndHistoricalDataScore: trendsAndHostoricalDataScore,
        existingSupplyList: exestingSupplyList,
        existingSupplyScore: exestingSupplyScore,
        interpretationAndOutlookList: interpretationAndOutlookList,
        recommendationsForInvestorsList: recommendationsForInvestorsList,
      };
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}locality-data/save`,
        locateObj
      );
      toast.success(response.data);
    }
  };

  const addScoreEvalution = () => {
    setShowModal(true);
    setTitle("Add Locality");
  };

  const addLocalEconomyToList = () => {
    setLocalEconomyList((prev) => [...prev, localEconomyPoint]);
    setLocalEconomyPoint("");
  };
  const addOngoingProjectsToList = () => {
    setOnGoingFutureProjectsList((prev) => [
      ...prev,
      onGoingFutureProjectsPoint,
    ]);
    setOnGoingFutureProjectsPoint("");
  };
  const addConnectivityAndCommuteToList = () => {
    setConnectivityAndCommuteList((prev) => [
      ...prev,
      connectivityAndCommutePoint,
    ]);
    setConnectivityAndCommutePoint("");
  };
  const addAmenitiesAndGentrificationToList = () => {
    setAmenitiesAndGentrificationList((prev) => [
      ...prev,
      amenitiesAndGentrificationPoint,
    ]);
    setAmenitiesAndGentrificationPoint("");
  };
  const addTrendsAndHistoricalDataToList = () => {
    setTrendsAndHostoricalDataList((prev) => [
      ...prev,
      trendsAndHostoricalDataPoint,
    ]);
    setTrendsAndHostoricalDataPoint("");
  };
  const addExistingSupplyToList = () => {
    setExestingSupplyList((prev) => [...prev, exestingSupplyPoint]);
    setExestingSupplyPoint("");
  };
  const addIntepretationAndOutlookToList = () => {
    setInterpretationAndOutlookList((prev) => [
      ...prev,
      interpretationAndOutlook,
    ]);
    setInterpretationAndOutlook("");
  };
  const addRecommendationForInvestorsToList = () => {
    setRecommendationsForInvestorsList((prev) => [
      ...prev,
      recommendationsForInvestors,
    ]);
    setRecommendationsForInvestors("");
  };

  //Defining table columns
  const columns = [
    {
      field: "index",
      headerName: "S.no",
      width: 100,
      cellClassName: "centered-cell",
    },
    {
      field: "localityName",
      headerName: "Locality Name",
      flex: 1,
    },
    {
      field: "localEconomyScore",
      headerName: "Local Economy Score",
      flex: 1,
    },
    {
      field: "onGoingFutureProjectsScore",
      headerName: "OnGoing Future Projects Score",
      flex: 1,
    },
    {
      field: "connectivityAndCommuteScore",
      headerName: "Connectivity And Commute Score",
      flex: 1,
    },
    {
      field: "amenitiesAndGentrificationScore",
      headerName: "Amenities And Gentrification Score",
      flex: 1,
    },
    {
      field: "trendsAndHistoricalDataScore",
      headerName: "Trends And Historical Data Score",
      flex: 1,
    },
    {
      field: "existingSupplyScore",
      headerName: "Existing Supply Score",
      flex: 1,
    },
  ];
  return (
    <>
      <DashboardHeader
        buttonName={"Add Score Evalution"}
        functionName={addScoreEvalution}
        heading={"Manage Score Evalution"}
      />

      <div>
        <DataTable columns={columns} list={list} />
      </div>

      <Modal
        size="xl"
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="locality">
              <Form.Select
                value={localityId || 0}
                onChange={(e) => setLocalityId(e.target.value)}
              >
                <option value={0}>Select locality</option>
                {localityList.map((item, index) => (
                  <option key={item.id + "_" + index} value={item.id}>
                    {item.localityName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="localEconomy">
              <Form.Label className="fw-bold border-bottom border-2 pb-2">
                L – Local Economy & Indicators (200 pts)
              </Form.Label>
              {localEconomyList.length > 0 &&
                localEconomyList.map((item, index) => (
                  <ul className="mb-3" key={index}>
                    <li>{item}</li>
                  </ul>
                ))}
              <Form.Group className="mb-3" controlId="localEconomyScore">
                <Form.Control
                  type="number"
                  placeholder="Enter score out of 200"
                  name="localEconomyScore"
                  value={localEconomyScore}
                  onChange={(e) => setLocalEconomyScore(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="localEconomyPoint">
                <Form.Control
                  as="textarea"
                  placeholder="Start writing local economy points"
                  name="localEconomyPoint"
                  value={localEconomyPoint}
                  onChange={(e) => setLocalEconomyPoint(e.target.value)}
                />
                <Form.Control.Feedback type="invalid">
                  {`Local Economy & Indicators is required !`}
                </Form.Control.Feedback>
              </Form.Group>
              <Button className="mb-3" onClick={addLocalEconomyToList}>
                Add More Points For L - Local Economy
              </Button>
            </Form.Group>
            <Form.Group className="mb-3" controlId="onGoingFutureProjects">
              <Form.Label className="fw-bold border-bottom border-2 pb-2">
                O - Ongoing / Future Projects (150 pts)
              </Form.Label>
              {onGoingFutureProjectsList.length > 0 &&
                onGoingFutureProjectsList.map((item, index) => (
                  <ul className="mb-3" key={index}>
                    <li>{item}</li>
                  </ul>
                ))}
              <Form.Group
                className="mb-3"
                controlId="onGoingFutureProjectsScore"
              >
                <Form.Control
                  type="number"
                  placeholder="Enter score out of 150"
                  name="onGoingFutureProjectsScore"
                  value={onGoingFutureProjectsScore}
                  onChange={(e) =>
                    setOnGoingFutureProjectsScore(e.target.value)
                  }
                  required
                />
              </Form.Group>
              <Form.Group
                className="mb-3"
                controlId="onGoingFutureProjectsPoint"
              >
                <Form.Control
                  as="textarea"
                  placeholder="Start writing points"
                  name="onGoingFutureProjectsPoint"
                  value={onGoingFutureProjectsPoint}
                  onChange={(e) =>
                    setOnGoingFutureProjectsPoint(e.target.value)
                  }
                />
                <Form.Control.Feedback type="invalid">
                  {`Ongoing Future Projects Points is required !`}
                </Form.Control.Feedback>
              </Form.Group>
              <Button className="mb-3" onClick={addOngoingProjectsToList}>
                Add More Points For Ongoing Future Projects
              </Button>
            </Form.Group>
            <Form.Group className="mb-3" controlId="connectivityAndCommute">
              <Form.Label className="fw-bold border-bottom border-2 pb-2">
                C - Connectivity & Commute (150 pts)
              </Form.Label>
              {connectivityAndCommuteList.length > 0 &&
                connectivityAndCommuteList.map((item, index) => (
                  <ul className="mb-3" key={index}>
                    <li>{item}</li>
                  </ul>
                ))}
              <Form.Group
                className="mb-3"
                controlId="connectivityAndCommuteScore"
              >
                <Form.Control
                  type="number"
                  placeholder="Enter score out of 150"
                  name="connectivityAndCommuteScore"
                  value={connectivityAndCommuteScore}
                  onChange={(e) =>
                    setConnectivityAndCommuteScore(e.target.value)
                  }
                  required
                />
              </Form.Group>
              <Form.Group
                className="mb-3"
                controlId="connectivityAndCommutePoint"
              >
                <Form.Control
                  as="textarea"
                  placeholder="Start writing points"
                  name="connectivityAndCommutePoint"
                  value={connectivityAndCommutePoint}
                  onChange={(e) =>
                    setConnectivityAndCommutePoint(e.target.value)
                  }
                />
                <Form.Control.Feedback type="invalid">
                  {`Connectivity & Commute is required !`}
                </Form.Control.Feedback>
              </Form.Group>
              <Button
                className="mb-3"
                onClick={addConnectivityAndCommuteToList}
              >
                Add More Points For Connectivity & Commute
              </Button>
            </Form.Group>
            <Form.Group className="mb-3" controlId="amenitiesAndGentrification">
              <Form.Label className="fw-bold border-bottom border-2 pb-2">
                A - Amenities & Gentrification (150 pts)
              </Form.Label>
              {amenitiesAndGentrificationList.length > 0 &&
                amenitiesAndGentrificationList.map((item, index) => (
                  <ul className="mb-3" key={index}>
                    <li>{item}</li>
                  </ul>
                ))}
              <Form.Group
                className="mb-3"
                controlId="amenitiesAndGentrificationScore"
              >
                <Form.Control
                  type="number"
                  placeholder="Enter score out of 150"
                  name="amenitiesAndGentrificationScore"
                  value={amenitiesAndGentrificationScore}
                  onChange={(e) =>
                    setAmenitiesAndGentrificationScore(e.target.value)
                  }
                  required
                />
              </Form.Group>
              <Form.Group
                className="mb-3"
                controlId="amenitiesAndGentrificationPoint"
              >
                <Form.Control
                  as="textarea"
                  placeholder="Start writing points"
                  name="amenitiesAndGentrificationPoint"
                  value={amenitiesAndGentrificationPoint}
                  onChange={(e) =>
                    setAmenitiesAndGentrificationPoint(e.target.value)
                  }
                />
                <Form.Control.Feedback type="invalid">
                  {`Amenities & Gentrification is required !`}
                </Form.Control.Feedback>
              </Form.Group>
              <Button
                className="mb-3"
                onClick={addAmenitiesAndGentrificationToList}
              >
                Add More Points For Amenities & Gentrification
              </Button>
            </Form.Group>
            <Form.Group className="mb-3" controlId="trendsAndHostoricalData">
              <Form.Label className="fw-bold border-bottom border-2 pb-2">
                T - Trends & Historical Data (150 pts)
              </Form.Label>
              {trendsAndHostoricalDataList.length > 0 &&
                trendsAndHostoricalDataList.map((item, index) => (
                  <ul className="mb-3" key={index}>
                    <li>{item}</li>
                  </ul>
                ))}
              <Form.Group
                className="mb-3"
                controlId="trendsAndHostoricalDataScore"
              >
                <Form.Control
                  type="number"
                  placeholder="Enter score out of 150"
                  name="trendsAndHostoricalDataScore"
                  value={trendsAndHostoricalDataScore}
                  onChange={(e) =>
                    setTrendsAndHostoricalDataScore(e.target.value)
                  }
                  required
                />
              </Form.Group>
              <Form.Group
                className="mb-3"
                controlId="trendsAndHostoricalDataPoint"
              >
                <Form.Control
                  as="textarea"
                  placeholder="Start writing points"
                  name="trendsAndHostoricalDataPoint"
                  value={trendsAndHostoricalDataPoint}
                  onChange={(e) =>
                    setTrendsAndHostoricalDataPoint(e.target.value)
                  }
                />
                <Form.Control.Feedback type="invalid">
                  {`Trends & Historical points is required !`}
                </Form.Control.Feedback>
              </Form.Group>
              <Button
                className="mb-3"
                onClick={addTrendsAndHistoricalDataToList}
              >
                Add More Points For Trends & Historical
              </Button>
            </Form.Group>
            <Form.Group className="mb-3" controlId="exestingSupply">
              <Form.Label className="fw-bold border-bottom border-2 pb-2">
                E - Existing Supply vs Demand (200 pts)
              </Form.Label>
              {exestingSupplyList.length > 0 &&
                exestingSupplyList.map((item, index) => (
                  <ul className="mb-3" key={index}>
                    <li>{item}</li>
                  </ul>
                ))}
              <Form.Group className="mb-3" controlId="exestingSupplyScore">
                <Form.Control
                  type="number"
                  placeholder="Enter score out of 200"
                  name="exestingSupplyScore"
                  value={exestingSupplyScore}
                  onChange={(e) => setExestingSupplyScore(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="exestingSupplyPoint">
                <Form.Control
                  as="textarea"
                  placeholder="Start writing points"
                  name="exestingSupplyPoint"
                  value={exestingSupplyPoint}
                  onChange={(e) => setExestingSupplyPoint(e.target.value)}
                />
                <Form.Control.Feedback type="invalid">
                  {`Exesting & Supply points is required !`}
                </Form.Control.Feedback>
              </Form.Group>
              <Button className="mb-3" onClick={addExistingSupplyToList}>
                Add More Points For Exesting & Supply
              </Button>
            </Form.Group>

            <Form.Group className="mb-3" controlId="interpretationAndOutlook">
              <Form.Label className="fw-bold border-bottom border-2 pb-2">
                Interpretation & Outlook
              </Form.Label>
              {interpretationAndOutlookList.length > 0 &&
                interpretationAndOutlookList.map((item, index) => (
                  <ul className="mb-3" key={index}>
                    <li>{item}</li>
                  </ul>
                ))}
              <FormControl
                as="textarea"
                placeholder="Start writing points"
                name="interpretationAndOutlook"
                value={interpretationAndOutlook}
                onChange={(e) => setInterpretationAndOutlook(e.target.value)}
              />
              <Button
                className="mb-3"
                onClick={addIntepretationAndOutlookToList}
              >
                Add More Points For Interpretation & Outlook
              </Button>
            </Form.Group>
            <Form.Group
              className="mb-3"
              controlId="recommendationsForInvestors"
            >
              <Form.Label className="fw-bold border-bottom border-2 pb-2">
                Recommendations for Investors
              </Form.Label>
              {recommendationsForInvestorsList.length > 0 &&
                recommendationsForInvestorsList.map((item, index) => (
                  <ul className="mb-3" key={index}>
                    <li>{item}</li>
                  </ul>
                ))}
              <FormControl
                as="textarea"
                placeholder="Start writing points"
                name="recommendationsForInvestors"
                value={recommendationsForInvestors}
                onChange={(e) => setRecommendationsForInvestors(e.target.value)}
              />
              <Button
                className="mb-3"
                onClick={addRecommendationForInvestorsToList}
              >
                Add More Points For Recommendations for Investors
              </Button>
            </Form.Group>
            <Button type="submit">Submit</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}
