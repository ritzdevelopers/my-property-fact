export function splitLuxuryPrice(value) {
  const raw = String(value ?? "").trim();

  if (!raw || /request/i.test(raw)) {
    return { kicker: "Starting Price", amount: "On Request", suffix: "" };
  }

  const hasOnwards = /onwards/i.test(raw);
  const stripped = raw.replace(/\s*onwards\.?\s*/gi, "").trim();

  if (/[a-zA-Z]/.test(stripped.replace(/cr|lakh|lac/gi, ""))) {
    return {
      kicker: "Starting Price",
      amount: stripped,
      suffix: hasOnwards ? "Onwards" : "",
    };
  }

  const numeric = Number.parseFloat(stripped.replace(/[₹,\s]/g, ""));
  if (Number.isFinite(numeric) && numeric > 0 && !/cr|lakh|lac/i.test(stripped)) {
    if (numeric < 1) {
      return {
        kicker: "Starting Price",
        amount: `₹ ${Math.round(numeric * 100)} Lakh*`,
        suffix: "Onwards",
      };
    }
    return {
      kicker: "Starting Price",
      amount: `₹ ${numeric} Cr*`,
      suffix: "Onwards",
    };
  }

  return {
    kicker: "Starting Price",
    amount: stripped,
    suffix: hasOnwards ? "Onwards" : "",
  };
}

export default function LuxuryPricePlaque({ price, className = "" }) {
  const { kicker, amount, suffix } = splitLuxuryPrice(price);

  return (
    <div className={`mpf-lux-price ${className}`.trim()} aria-label={`${kicker} ${amount} ${suffix}`.trim()}>
      <span className="mpf-lux-price__kicker">{kicker}</span>
      <strong className="mpf-lux-price__amount">{amount}</strong>
      {suffix ? <span className="mpf-lux-price__suffix">{suffix}</span> : null}
    </div>
  );
}
