"use client";

import "./style/PropertyEMICard.css";

const PropertyEMICard = ({
  property,
  formatPrice,
}) => {

  const totalPrice = Number(
    property?.totalPrice ??
    property?.expectedPrice ??
    property?.price ??
    property?.amount ??
    0
  );

  if (totalPrice <= 0) {
    return (
      <div className="property-emi-card">
        <h3 className="property-emi-title">
          EMI Calculator
        </h3>

        <p>Price not available.</p>
      </div>
    );
  }

  const loanAmount = totalPrice * 0.9;

  const interestRate = 8.5;

  const tenure = 20;

  const monthlyRate = interestRate / 12 / 100;

  const months = tenure * 12;

  const emi =
    (loanAmount *
      monthlyRate *
      Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);

  return (
    <div className="property-emi-card">

      <h3 className="property-emi-title">
        EMI Calculator
      </h3>

      <div className="property-loan-details">

        <span className="loan-label">
          Loan Amount
        </span>

        <h2 className="loan-price">
          {formatPrice(loanAmount)}
        </h2>

        <p className="loan-percent">
          (90% of property value)
        </p>

      </div>

      <div className="emi-result-box">

        <span className="emi-label">
          Estimated EMI
        </span>

        <h2 className="emi-price">
          ₹{Math.round(emi).toLocaleString("en-IN")}/month
        </h2>

        <p className="emi-note">
          {interestRate}% Interest • {tenure} Years
        </p>

      </div>

    </div>
  );
};

export default PropertyEMICard;