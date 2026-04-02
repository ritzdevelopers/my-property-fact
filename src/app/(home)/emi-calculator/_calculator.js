"use client";
export default function CalculatorForm({
    setLoanAmount,
    setInterestRate,
    setLoanTenure,
    loanAmount,
    interestRate,
    loanTenure,
    calculateEMI
}) {
    return (
        <>
            <div className="mb-5">
                <label htmlFor="loanAmount" className="form-label">Loan Amount (₹)</label>
                <input
                    type="number"
                    className="form-control"
                    id="loanAmount"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    placeholder="Enter loan amount"
                />
            </div>

            <div className="mb-5">
                <label htmlFor="interestRate" className="form-label">Interest Rate (annual %)</label>
                <input
                    type="number"
                    className="form-control"
                    id="interestRate"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    placeholder="Enter annual interest rate"
                />
            </div>

            <div className="mb-5">
                <label htmlFor="loanTenure" className="form-label">Loan Tenure (months)</label>
                <input
                    type="number"
                    className="form-control"
                    id="loanTenure"
                    value={loanTenure}
                    onChange={(e) => setLoanTenure(e.target.value)}
                    placeholder="Enter loan tenure in months"
                />
            </div>

            <div className="d-grid gap-2">
                <button className="btn btn-background text-white" onClick={calculateEMI}>
                    <span className='m-0 p-0 fw-bold'>Calculate EMI</span>
                </button>
            </div>
        </>
    )
}