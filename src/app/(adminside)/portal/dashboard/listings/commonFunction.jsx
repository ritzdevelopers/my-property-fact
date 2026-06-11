import axios from "axios";
import Multiselect from "multiselect-react-dropdown";
import { useEffect, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";

export function Section({ title, children }) {
  return (
    <div className="mb-4 p-3 border rounded-3 bg-light">
      <h5 className="mb-3">{title}</h5>
      {children}
    </div>
  );
}

export function CheckGroup({ label, name, options, values = [], onChange }) {
  return (
    <Form.Group className="mb-3">
      <Form.Label className="fw-semibold">{label}</Form.Label>
      <div className="d-flex flex-wrap gap-3">
        {options.map((opt) => (
          <Form.Check
            key={opt.value}
            type="checkbox"
            label={opt.label}
            checked={values.includes(opt.value)}
            onChange={(e) => {
              const next = e.target.checked
                ? [...values, opt.value]
                : values.filter((v) => v !== opt.value);
              onChange(name, next);
            }}
          />
        ))}
      </div>
    </Form.Group>
  );
}

export function NumberInput({
  label,
  name,
  value,
  onChange,
  min,
  step,
  placeholder,
}) {
  return (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      <Form.Control
        type="number"
        name={name}
        value={value ?? ""}
        onChange={(e) => onChange(name, e.target.value)}
        min={min}
        step={step}
        placeholder={placeholder}
      />
    </Form.Group>
  );
}

export function TextInput({ label, name, value, onChange, placeholder }) {
  return (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      <Form.Control
        name={name}
        value={value ?? ""}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
      />
    </Form.Group>
  );
}

export function SelectInput({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = "Select",
}) {
  return (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      <Form.Select
        name={name}
        value={value ?? ""}
        onChange={(e) => onChange(name, e.target.value)}
      >
        <option value="">{placeholder}...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  );
}

export function FileInput({ label, name, onChange, multiple }) {
  const [previews, setPreviews] = useState([]);

  const handleFilesChange = (files) => {
    const fileArray = Array.from(files || []);
    setPreviews((prev) => [...prev, ...fileArray]);
    onChange(name, [...previews, ...fileArray]);
  };

  const handleRemove = (index) => {
    const updated = previews.filter((_, i) => i !== index);
    setPreviews(updated);
    onChange(name, updated);
  };
  return (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      {/* Preview Container */}
      {previews.length > 0 && (
        <div
          className="d-flex flex-wrap mb-3 p-3"
          style={{
            border: "2px dashed #6c757d",
            borderRadius: "10px",
            gap: "10px",
          }}
        >
          {previews.map((file, index) => (
            <div key={index} className="position-relative">
              {/* Image Preview */}
              <img
                src={URL.createObjectURL(file)}
                alt={`preview-${index}`}
                width={200}
                height={100}
                className="rounded-3"
              />
              {/* Remove Button */}
              <Button
                variant="danger"
                size="sm"
                className="position-absolute top-0 end-0 m-1 rounded-circle p-1"
                onClick={() => handleRemove(index)}
                style={{
                  width: "24px",
                  height: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                }}
              >
                {/* <X size={14} /> */}X
              </Button>
            </div>
          ))}
        </div>
      )}
      <Form.Control
        type="file"
        accept="image/*"
        multiple={!!multiple}
        onChange={(e) => handleFilesChange(e.target.files)}
      />
    </Form.Group>
  );
}

export function CommercialFields({ data, setField }) {
  return (
    <>
      <SelectInput
        label="Commercial Sub-Type"
        name="commercialSubType"
        value={data.commercialSubType}
        onChange={setField}
        options={["Office", "Retail", "Warehouse", "Co-working"]}
      />
      {data.commercialSubType === "Office" && (
        <Commercial_Office data={data} setField={setField} />
      )}
      {data.commercialSubType === "Retail" && (
        <Commercial_Retail data={data} setField={setField} />
      )}
      {data.commercialSubType === "Warehouse" && (
        <Commercial_Warehouse data={data} setField={setField} />
      )}
      {data.commercialSubType === "Co-working" && (
        <Commercial_Cowork data={data} setField={setField} />
      )}
    </>
  );
}

// -------------------------------
// Step 4: Property Features (Residential or Commercial)
// -------------------------------
export function ResidentialFields({ data, setField }) {
  const [amenities, setAmenities] = useState([]);
  const [selectedValue, setSelectedValue] = useState([]);
  const fetchAllAmenities = async () => {
    const amenityList = await axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}amenity/get-all`)
      .then((res) => {
        setAmenities(res.data);
        return res.data;
      });
    return amenityList;
  };

  useEffect(() => {
    fetchAllAmenities();
  }, []);

  return (
    <>
      <Section title="Configuration">
        <Row>
          <Col md={3}>
            <NumberInput
              label="Bedrooms (BHK)"
              name="bedrooms"
              value={data.bedrooms}
              onChange={setField}
              min={0}
              step={1}
            />
          </Col>
          <Col md={3}>
            <NumberInput
              label="Bathrooms"
              name="bathrooms"
              value={data.bathrooms}
              onChange={setField}
              min={1}
              step={1}
            />
          </Col>
          <Col md={3}>
            <NumberInput
              label="Balconies"
              name="balconies"
              value={data.balconies}
              onChange={setField}
              min={0}
              step={1}
            />
          </Col>
          <Col md={3}>
            <SelectInput
              label="Additional rooms"
              name="additionalRooms"
              value={data.additionalRooms}
              onChange={setField}
              placeholder="Select..."
              options={["Study", "Servant", "Store", "Pooja"]}
            />
          </Col>
        </Row>
      </Section>

      <Section title="Furnishing">
        <SelectInput
          label="Furnishing level"
          name="furnishingLevel"
          value={data.furnishingLevel}
          onChange={setField}
          options={["Unfurnished", "Semi-furnished", "Fully-furnished"]}
        />
        {/* <TextInput
          label="Included items"
          name="includedItems"
          value={data.includedItems}
          onChange={setField}
          placeholder="Fans, lights, wardrobes, ACs, kitchen modules, RO, geysers"
        /> */}
        <TextSelectableInput
          label="Included items"
          name="includedItems"
          value={data.includedItems}
          onChange={setField}
          options={[
            "Fans",
            "Lights",
            "Curtains/Blinds",
            "Wardrobes",
            "ACs",
            "Kitchen modules",
            "RO",
            "Geysers",
            "Exhausts",
            "Washing machine",
            "Refrigerator",
            "Microwave",
            "Water heater",
            "Chimney",
            "Dining table",
            "Sofa",
            "TV",
            "WIFI",
            "Other",
          ]}
        />
      </Section>

      <Section title="Orientation & Condition">
        <Row>
          <Col md={6}>
            <SelectInput
              label="Unit facing"
              name="unitFacing"
              value={data.unitFacing}
              onChange={setField}
              options={[
                "North",
                "East",
                "West",
                "South",
                "North East",
                "North West",
                "South East",
                "South West",
              ]}
            />
          </Col>
          <Col md={6}>
            <NumberInput
              label="Age of property (years)"
              name="ageOfProperty"
              value={data.ageOfProperty}
              onChange={setField}
              min={0}
              step={1}
            />
          </Col>
        </Row>
        {/* <TextInput
          as="textarea"
          rows={4}
          label="Renovation history (year & scope)"
          name="renovationHistory"
          value={data.renovationHistory ?? ""}
          onChange={setField}
        /> */}
        <Form.Group className="mb-3">
          <Form.Label>Renovation history (year & scope)</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={data.renovationHistory ?? ""}
            onChange={(e) => setField("renovationHistory", e.target.value)}
            placeholder="Write details..."
          />
        </Form.Group>
      </Section>

      <Section title="Society / Amenities & Safety">
        {/* <TextInput
          label="Society features"
          name="societyFeatures"
          value={data.societyFeatures}
          onChange={setField}
          placeholder="Clubhouse, pool, gym, garden, kids area, STP, RWH..."
        /> */}
        <Form.Label>Society features</Form.Label>
        <Multiselect
          className="mb-3"
          options={amenities || []}
          selectedValues={selectedValue}
          onSelect={(selectedList) => setField("amenities", selectedList)}
          onRemove={(selectedList) => setField("amenities", selectedList)}
          displayValue="title"
        />
      </Section>

      {data.transaction === "Rent/Lease" && (
        <Section title="Restrictions (Rent)">
          <TextInput
            label="Restrictions"
            name="restrictions"
            value={data.restrictions}
            onChange={setField}
            placeholder="Alcohol/Non-veg/Other (if RWA rules)"
          />
        </Section>
      )}
    </>
  );
}

export function Commercial_Office({ data, setField }) {
  return (
    <Section title="Office (Bare/Warm/Furnished)">
      <SelectInput
        label="Fit-out status"
        name="fitOutStatus"
        value={data.fitOutStatus}
        onChange={setField}
        options={["Bare shell", "Warm shell", "Fully furnished"]}
      />
      <Row>
        <Col md={6}>
          <TextInput
            label="Workstations / Cabins / Meeting rooms"
            name="capacityCounts"
            value={data.capacityCounts}
            onChange={setField}
            placeholder="e.g., 40 WS, 3 cabins, 2 MR"
          />
        </Col>
        <Col md={6}>
          <TextInput
            label="Floor plate & grid"
            name="floorPlateGrid"
            value={data.floorPlateGrid}
            onChange={setField}
          />
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <NumberInput
            label="Sanctioned load (kW)"
            name="sanctionedLoad"
            value={data.sanctionedLoad}
            onChange={setField}
            min={0}
            step={1}
          />
        </Col>
        <Col md={6}>
          <TextInput
            label="HVAC type & hours"
            name="hvac"
            value={data.hvac}
            onChange={setField}
            placeholder="Central/VRV/Split; 9×5 or 24×7"
          />
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <NumberInput
            label="Clear height (ft)"
            name="clearHeight"
            value={data.clearHeight}
            onChange={setField}
            min={0}
            step={0.1}
          />
        </Col>
        <Col md={6}>
          <TextInput
            label="Parking ratio & slots"
            name="parkingRatio"
            value={data.parkingRatio}
            onChange={setField}
            placeholder="cars/1000 sq ft + total slots"
          />
        </Col>
      </Row>
      <SelectInput
        label="Building grade"
        name="buildingGrade"
        value={data.buildingGrade}
        onChange={setField}
        options={["A", "B", "C"]}
      />
      <TextInput
        label="Compliance (Fire NOC, Sprinklers, Smoke detectors)"
        name="officeCompliance"
        value={data.officeCompliance}
        onChange={setField}
      />
      <Row>
        <Col md={6}>
          <NumberInput
            label="Base rent (₹/sq ft/mo) [Lease]"
            name="officeBaseRent"
            value={data.officeBaseRent}
            onChange={setField}
            min={0}
            step={1}
          />
        </Col>
        <Col md={6}>
          <TextInput
            label="CAM (₹/sq ft/mo)"
            name="officeCam"
            value={data.officeCam}
            onChange={setField}
          />
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <TextInput
            label="Lease terms (lock-in, deposit, escalation, min term)"
            name="leaseTerms"
            value={data.leaseTerms}
            onChange={setField}
          />
        </Col>
        <Col md={6}>
          <TextInput
            label="Availability (Vacant/Occupied + notice)"
            name="availability"
            value={data.availability}
            onChange={setField}
          />
        </Col>
      </Row>
    </Section>
  );
}

export function Commercial_Retail({ data, setField }) {
  return (
    <Section title="Retail Shop/Showroom">
      <Row>
        <Col md={6}>
          <NumberInput
            label="Frontage width (ft)"
            name="frontageWidth"
            value={data.frontageWidth}
            onChange={setField}
            min={0}
            step={0.1}
          />
        </Col>
        <Col md={6}>
          <NumberInput
            label="Clear height (ft)"
            name="retailHeight"
            value={data.retailHeight}
            onChange={setField}
            min={0}
            step={0.1}
          />
        </Col>
      </Row>
      <TextInput
        label="Entry shutters/doors (no. & width)"
        name="entryAccess"
        value={data.entryAccess}
        onChange={setField}
      />
      <TextInput
        label="Signage rights"
        name="signageRights"
        value={data.signageRights}
        onChange={setField}
      />
      <Row>
        <Col md={6}>
          <NumberInput
            label="Power load (kW)"
            name="retailPower"
            value={data.retailPower}
            onChange={setField}
            min={0}
            step={1}
          />
        </Col>
        <Col md={6}>
          <TextInput
            label="AC (type/hours)"
            name="retailAC"
            value={data.retailAC}
            onChange={setField}
          />
        </Col>
      </Row>
      <TextInput
        label="Customer parking (yes/no + slots)"
        name="customerParking"
        value={data.customerParking}
        onChange={setField}
      />
      <TextInput
        label="Compliance (Fire NOC, FSI/Zoning fit)"
        name="retailCompliance"
        value={data.retailCompliance}
        onChange={setField}
      />
    </Section>
  );
}

export function Commercial_Warehouse({ data, setField }) {
  return (
    <Section title="Warehouse / Industrial">
      <Row>
        <Col md={6}>
          <NumberInput
            label="Plot area (sq ft)"
            name="plotArea"
            value={data.plotArea}
            onChange={setField}
            min={0}
            step={1}
          />
        </Col>
        <Col md={6}>
          <NumberInput
            label="Built-up (sq ft)"
            name="whBuiltUp"
            value={data.whBuiltUp}
            onChange={setField}
            min={0}
            step={1}
          />
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <NumberInput
            label="Clear height at eaves (ft)"
            name="eavesHeight"
            value={data.eavesHeight}
            onChange={setField}
            min={0}
            step={0.1}
          />
        </Col>
        <Col md={6}>
          <NumberInput
            label="Floor load (T/sq m)"
            name="floorLoad"
            value={data.floorLoad}
            onChange={setField}
            min={0}
            step={0.1}
          />
        </Col>
      </Row>
      <Row>
        <Col md={4}>
          <NumberInput
            label="Dock doors"
            name="dockDoors"
            value={data.dockDoors}
            onChange={setField}
            min={0}
            step={1}
          />
        </Col>
        <Col md={4}>
          <NumberInput
            label="Dock levelers"
            name="dockLevelers"
            value={data.dockLevelers}
            onChange={setField}
            min={0}
            step={1}
          />
        </Col>
        <Col md={4}>
          <NumberInput
            label="Drive-ins"
            name="driveIns"
            value={data.driveIns}
            onChange={setField}
            min={0}
            step={1}
          />
        </Col>
      </Row>
      <TextInput
        label="Truck access / turning radius (ft/m)"
        name="truckAccess"
        value={data.truckAccess}
        onChange={setField}
      />
      <Row>
        <Col md={6}>
          <NumberInput
            label="Sanctioned load (kW)"
            name="whPower"
            value={data.whPower}
            onChange={setField}
            min={0}
            step={1}
          />
        </Col>
        <Col md={6}>
          <TextInput
            label="Fire (Sprinklers/Hydrants)"
            name="whFire"
            value={data.whFire}
            onChange={setField}
          />
        </Col>
      </Row>
      <TextInput
        label="Compliance (Factory license/PCB NOC)"
        name="whCompliance"
        value={data.whCompliance}
        onChange={setField}
      />
      <Row>
        <Col md={6}>
          <TextInput
            label="Highway proximity (km)"
            name="highwayProximity"
            value={data.highwayProximity}
            onChange={setField}
          />
        </Col>
        <Col md={6}>
          <TextInput
            label="Last-mile roads"
            name="lastMileRoads"
            value={data.lastMileRoads}
            onChange={setField}
          />
        </Col>
      </Row>
    </Section>
  );
}

export function Commercial_Cowork({ data, setField }) {
  return (
    <Section title="Co-working / Managed Office">
      <SelectInput
        label="Seat type"
        name="seatType"
        value={data.seatType}
        onChange={setField}
        options={["Dedicated", "Hot", "Private cabin"]}
      />
      <Row>
        <Col md={6}>
          <NumberInput
            label="Seats available"
            name="seatsAvailable"
            value={data.seatsAvailable}
            onChange={setField}
            min={0}
            step={1}
          />
        </Col>
        <Col md={6}>
          <NumberInput
            label="Price (₹/seat/month + taxes)"
            name="seatPrice"
            value={data.seatPrice}
            onChange={setField}
            min={0}
            step={1}
          />
        </Col>
      </Row>
      <TextInput
        label="Inclusions"
        name="cwInclusions"
        value={data.cwInclusions}
        onChange={setField}
        placeholder="Internet, printing, meeting room credits, pantry"
      />
      <TextInput
        label="Hours & access"
        name="cwHours"
        value={data.cwHours}
        onChange={setField}
        placeholder="24×7 or business hours"
      />
    </Section>
  );
}

export function TextSelectableInput({ label, name, value, onChange, options }) {
  return (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      {options && options.length > 0 && (
        <div className="d-flex flex-wrap">
          {options.map((opt) => {
            const parts = (value || "").split(",").map((p) => p.trim());
            const isSelected = parts.includes(opt);

            return (
              <span
                key={opt}
                className={`m-2 px-3 py-2 badge rounded-pill fs-6 
              ${
                isSelected
                  ? "bg-primary text-white border border-dark"
                  : "bg-secondary text-light"
              }`}
                style={{
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                }}
                onClick={() => {
                  if (!isSelected) {
                    parts.push(opt);
                  } else {
                    const index = parts.indexOf(opt);
                    if (index > -1) parts.splice(index, 1);
                  }
                  onChange(name, parts.join(", "));
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.target.classList.remove("bg-secondary");
                    e.target.classList.add("bg-dark");
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.target.classList.remove("bg-dark");
                    e.target.classList.add("bg-secondary");
                  }
                }}
              >
                {opt}
              </span>
            );
          })}
        </div>
      )}
    </Form.Group>
  );
}
