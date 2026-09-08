import LoanEligibilityCalculator from "./LoanEligibilityCalculator";

export const metadata = {
  title: "Home Loan Eligibility Calculator | Check Loan Amount Online | MPF",
  description:
    "Find out how much home loan you may be eligible for based on your income, existing EMI, tenure, and interest rate. Estimate EMI and total payable instantly.",
  keywords: [
    "home loan eligibility calculator",
    "home loan calculator",
    "loan eligibility calculator india",
    "how much home loan can I get",
    "housing loan eligibility",
    "home loan emulator",
    "loan amount calculator",
    "home loan EMI eligibility",
  ],
  alternates: {
    canonical: "https://mypropertyfact.in/home-loan-calculator",
  },
};

export default function HomeLoanCalculatorPage() {
  return <LoanEligibilityCalculator />;
}
