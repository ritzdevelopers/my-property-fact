/** Shared EMI calculator FAQ copy — used by UI and FAQPage JSON-LD. */
export const EMI_CALCULATOR_FAQ_ITEMS = [
  {
    id: 1,
    question: "What is a Home Loan Calculator?",
    answer:
      "An online tool that lets you plug in loan amount, interest rate, and tenure to generate your monthly EMI, total interest payable, and total repayment. It helps you compare scenarios instantly and plan affordability before approaching lenders.",
  },
  {
    id: 2,
    question: "What is EMI?",
    answer:
      "EMI—Equated Monthly Instalment—is the fixed amount you repay every month. Each payment has two parts: principal reduction and interest charged on the outstanding balance. As the loan ages, the interest portion shrinks and the principal portion grows.",
  },
  {
    id: 3,
    question: "How is EMI calculated on a home loan?",
    answer:
      "EMI is derived from the amortisation formula P × r × (1 + r)ⁿ ÷ [(1 + r)ⁿ – 1], where P is loan principal, r is monthly interest rate, and n is total months. Most calculators compute this instantly and also display the year wise principal interest split.",
  },
  {
    id: 4,
    question: "Factors that affect EMI",
    answer:
      "Loan amount, interest rate, and tenure are the three direct levers. Credit score, income profile, property type, lender risk policies, and whether the rate is fixed or floating indirectly influence EMI by altering the rate offered or the maximum tenure allowed.",
  },
  {
    id: 5,
    question: "What is the EMI for a ₹20 lakh home loan?",
    answer:
      "At 8.50 % interest for 20 years, the EMI is roughly ₹17,400. Change any variable—say opt for 15 years or negotiate 7.50 %—and the EMI falls to about ₹18,600 or ₹16,600 respectively. Always run exact numbers in the calculator.",
  },
  {
    id: 6,
    question: "How much home loan can I get if my salary is ₹25,000?",
    answer:
      "Banks usually cap total EMIs at 40 – 50 % of net income. Assuming 45 %, your permissible EMI is ~₹11,250. At 9 % for 20 years, that supports a loan of roughly ₹11 – 12 lakh. Actual eligibility also depends on credit score and liabilities.",
  },
  {
    id: 7,
    question: "What is the EMI for a ₹5 lakh home loan?",
    answer:
      "For a small ₹5 lakh loan at 9 % over 5 years, the EMI is about ₹10,400. Stretching tenure to 10 years drops EMI to around ₹6,300 but increases total interest. Use the calculator to fine tune your own rate tenure mix.",
  },
  {
    id: 8,
    question: "What is the minimum salary for a home loan?",
    answer:
      "There's no uniform number. Many lenders accept net monthly incomes from ₹15,000 upward in tier 2 cities and ₹25,000 in metros. The key is that post EMI disposable income must meet their internal living expense threshold and you must clear credit checks.",
  },
  {
    id: 9,
    question: "What is the interest on a ₹20 lakh home loan?",
    answer:
      "At 8.50 % for 20 years, you'll pay about ₹21 lakh in interest—slightly more than the principal. Cut the tenure to 15 years and interest drops to roughly ₹14 lakh. Even small rate concessions or pre payments dramatically lower this figure.",
  },
  {
    id: 10,
    question: "What will be the EMI for a ₹40 lakh home loan?",
    answer:
      "Using 8 % annual interest and 20 year tenure, EMI is about ₹33,400. Halving the tenure to 10 years raises EMI to ~₹48,500 but saves ~₹14 lakh in interest. Always model scenarios to balance cash flow comfort against lifetime cost.",
  },
  {
    id: 11,
    question: "Can I get a 100 % home loan?",
    answer:
      "Indian regulators cap Loan to Value at 90 % for loans under ₹30 lakh, 80 % up to ₹75 lakh, and 75 % above that. So a true 100 % mortgage is not permitted; you must fund the margin plus registration and taxes.",
  },
  {
    id: 12,
    question: "What is the maximum home loan amount?",
    answer:
      "There's no absolute ceiling. Eligibility hinges on income, existing liabilities, property's value, and lender policy. High income applicants with strong credit can secure crores, sometimes via blended loans with co applicants. The LTV cap still limits funding to 75–90 % of property price.",
  },
  {
    id: 13,
    question: "What is the maximum tenure allowed for a home loan?",
    answer:
      "Most banks offer up to 30 years, subject to the borrower not exceeding 60–70 years of age at loan maturity. Longer tenure lowers EMI but significantly raises total interest; many borrowers aim to pre pay and finish early.",
  },
  {
    id: 14,
    question: "What is the processing fee applicable on the home loan?",
    answer:
      "Processing fees typically range from 0.25 %–1 % of the sanctioned amount, plus GST, with minimum and maximum slabs (e.g., ₹10,000 to ₹25,000). Some lenders run zero processing fee promotions, but always watch for other bundled charges.",
  },
  {
    id: 15,
    question: "What is LTV ratio?",
    answer:
      "Loan to Value is the percentage of the property price that the bank finances. An LTV of 80 % on a ₹50 lakh home means the lender funds ₹40 lakh and you provide ₹10 lakh plus taxes and fees.",
  },
  {
    id: 16,
    question: "What is credit score?",
    answer:
      "A three digit number (300–900) summarising your repayment behaviour. Scores above 750 typically unlock faster approvals, lower interest rates, and higher eligibility. Bureaus like CIBIL, Experian, Equifax, and CRIF High Mark compute it from loan and credit card histories.",
  },
  {
    id: 17,
    question: "What factors can impact the credit score?",
    answer:
      "Late or missed payments, high credit card utilisation, frequent loan enquiries, short credit history, and having many unsecured loans pull scores down. Timely repayments, low utilisation (<30 %), diverse credit mix, and minimal hard enquiries push scores up.",
  },
  {
    id: 18,
    question: "Is there a pre payment charge on home loans?",
    answer:
      "For floating rate residential loans, RBI mandates zero foreclosure or part prepayment penalty. Fixed rate loans may carry 2–3 % charges unless paid from personal funds. Always verify your lender's clause before signing.",
  },
  {
    id: 19,
    question: "What is REPO linked home loan rate?",
    answer:
      "A lending rate that resets directly to RBI's repo rate plus a fixed spread. When the central bank cuts repo, your rate—and hence EMI—falls almost immediately, making pricing more transparent than older MCLR based loans.",
  },
  {
    id: 20,
    question: "Which is better: Fixed rate or Floating rate home loan?",
    answer:
      "Fixed offers EMI certainty but starts higher and locks you in if rates fall. Floating is cheaper upfront and benefits from rate cuts, yet EMIs can rise during tightening cycles. Choose fixed for budgeting stability; choose floating for potential savings with rate change tolerance.",
  },
];
