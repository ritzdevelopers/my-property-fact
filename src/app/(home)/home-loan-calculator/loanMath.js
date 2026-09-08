const FOIR = {
  salaried: 0.5,
  "self-employed": 0.45,
};

const RETIREMENT_AGE = {
  salaried: 60,
  "self-employed": 65,
};

export const TENURE_OPTIONS = [5, 10, 15, 20, 25, 30];
export const RATE_OPTIONS = [6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12];

export function formatINR(value) {
  if (value == null || Number.isNaN(Number(value))) return "₹ —";
  return `₹ ${Math.round(Number(value)).toLocaleString("en-IN")}`;
}

export function formatPercent(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return `${n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)}%`;
}

function toNumber(value) {
  const n = parseFloat(String(value).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function requestedTenureYears(requestedYears) {
  return Math.max(1, Math.min(30, toNumber(requestedYears) || 20));
}

export function getEffectiveTenureYears(requestedYears, age, employmentType) {
  const requested = requestedTenureYears(requestedYears);
  const currentAge = toNumber(age);
  if (!currentAge) return requested;
  const retireAt = RETIREMENT_AGE[employmentType] || RETIREMENT_AGE.salaried;
  return Math.max(1, Math.min(requested, retireAt - currentAge, 30));
}

function loanFromEmi(emi, monthlyRate, months) {
  if (emi <= 0 || months <= 0) return 0;
  if (monthlyRate <= 0) return emi * months;
  const factor = Math.pow(1 + monthlyRate, months);
  return emi * ((factor - 1) / (monthlyRate * factor));
}

export function calculateEligibility({
  monthlyIncome,
  existingEmi,
  tenureYears,
  interestRate,
  employmentType,
  age,
}) {
  const income = toNumber(monthlyIncome);
  const emiOut = Math.max(0, toNumber(existingEmi));
  const rate = toNumber(interestRate);
  const requestedTenure = requestedTenureYears(tenureYears);
  const years = getEffectiveTenureYears(tenureYears, age, employmentType);
  const foir = FOIR[employmentType] || FOIR.salaried;
  const eligibleEmi = income * foir - emiOut;
  const monthlyRate = rate / 12 / 100;
  const months = years * 12;

  const base = {
    interestRate: rate,
    tenureYears: years,
    requestedTenure,
    tenureCapped: years < requestedTenure,
  };

  if (income <= 0 || rate <= 0 || months <= 0 || eligibleEmi <= 0) {
    return {
      ...base,
      eligibleAmount: 0,
      monthlyEmi: 0,
      totalInterest: 0,
      totalPayable: 0,
      principalPercent: 0,
      interestPercent: 0,
      notEligible: eligibleEmi <= 0 && income > 0,
    };
  }

  const loanAmount = loanFromEmi(eligibleEmi, monthlyRate, months);
  const totalPayable = eligibleEmi * months;
  const totalInterest = Math.max(0, totalPayable - loanAmount);
  const principalPercent = totalPayable > 0 ? (loanAmount / totalPayable) * 100 : 0;

  return {
    ...base,
    eligibleAmount: loanAmount,
    monthlyEmi: eligibleEmi,
    totalInterest,
    totalPayable,
    principalPercent,
    interestPercent: 100 - principalPercent,
    notEligible: false,
  };
}

export function validateInputs({ monthlyIncome, interestRate, age, existingEmi }) {
  const income = toNumber(monthlyIncome);
  const rate = toNumber(interestRate);
  const currentAge = toNumber(age);
  const emiOut = toNumber(existingEmi);

  if (!income || income < 1000) {
    return "Enter a valid monthly income of at least ₹1,000.";
  }
  if (emiOut < 0) {
    return "Existing EMI cannot be negative.";
  }
  if (emiOut >= income) {
    return "Existing EMI should be less than your monthly income.";
  }
  if (!rate || rate < 1 || rate > 24) {
    return "Enter an interest rate between 1% and 24%.";
  }
  if (!currentAge || currentAge < 18 || currentAge > 70) {
    return "Enter your age between 18 and 70 years.";
  }
  return "";
}
