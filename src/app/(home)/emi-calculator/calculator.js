"use client";
import { useState } from 'react';
import CommonHeaderBanner from '../components/common/commonheaderbanner';
import CommonBreadCrum from '../components/common/breadcrum';
import styles from './page.module.css';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Accordion, Container, Modal } from 'react-bootstrap';
import CalculatorForm from './_calculator';
import { PieChart } from '@mui/x-charts';
import { EMI_CALCULATOR_FAQ_ITEMS } from './emiCalculatorFaqItems';


export default function Calculator() {
    // States for loan amount, interest rate, and loan tenure
    const [loanAmount, setLoanAmount] = useState(0);
    const [interestRate, setInterestRate] = useState(0);
    const [loanTenure, setLoanTenure] = useState(0);
    const [emi, setEmi] = useState(null);
    const [intrestPayable, setIntrestPayable] = useState(null);
    const [totalAmountPaid, setTotalAmountPaid] = useState(null);
    const [showCalculator, setShowCalculator] = useState(false);
    const [title, setTitle] = useState("");
    const [childList, setChildList] = useState([]);
    // EMI calculation logic
    const calculateEMI = () => {
        if (loanAmount && interestRate && loanTenure) {
            const principal = parseFloat(loanAmount);
            const annualRate = parseFloat(interestRate) / 100;
            const months = parseFloat(loanTenure);

            const monthlyRate = annualRate / 12;
            const emi =
                (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
                (Math.pow(1 + monthlyRate, months) - 1);
            const intrest = emi.toFixed(2) * months - principal;
            setIntrestPayable(intrest.toFixed(2));
            setEmi(emi.toFixed(2)); // Set EMI result
            setTotalAmountPaid(emi.toFixed(2) * months);
            setShowCalculator(false);
        } else {
            alert('Please fill in all the fields');
        }
    };
    //data array for top grid
    const dataArray = [
        {
            id: 1,
            title: "Monthly EMI",
            description: "the bite out of your salary each month",
            heading: "Monthly EMI – What You Should Know",
            childData: [
                {
                    id: 1,
                    text: "<p>Keep your EMI within <b>35% of your net monthly income</b> to stay financially comfortable.</p>"
                },
                {
                    id: 2,
                    text: "<p>A <b>lower EMI isn’t always better</b>. Longer tenures mean much higher total interest.</p>"
                },
                {
                    id: 3,
                    text: "<p>Use EMI estimates to plan <b>prepayments</b>, which can reduce your loan term drastically.</p>"
                },
                {
                    id: 4,
                    text: "<p>Always <b>stress-test EMI</b> by adding 1–1.5% to the interest rate. It prepares you for future hikes.</p>"
                },
                {
                    id: 5,
                    text: "<p>EMI amounts help <b>determine eligibility</b> but never borrow more than you can breathe under.</p>"
                },
            ]
        },
        {
            id: 2,
            title: "Total Interest Payable ",
            description: "what the bank earns from you",
            heading: "Total Interest Payable – What You Should Know",
            childData: [
                {
                    id: 1,
                    text: "<p>The longer your loan tenure, the more interest you pay. <b>Even small tenure cuts can save lakhs.</b></p>"
                },
                {
                    id: 2,
                    text: "<p><b>Prepaying early</b> in the loan cycle reduces interest drastically due to the front-loaded structure.</p>"
                },
                {
                    id: 3,
                    text: "<p>Avoid being lured by low EMI if it <b>balloons your total interest burden</b>.</p>"
                },
                {
                    id: 4,
                    text: "<p>Use total interest figures to <b>evaluate true loan cost</b>, not just monthly affordability.</p>"
                },
                {
                    id: 5,
                    text: "<p>Compare lenders beyond rates, <b>processing fees, and reset clauses</b> impact overall payout.</p>"
                },
            ]
        },
        {
            id: 3,
            title: "Total Payout ",
            description: "principal + interest over the loan’s life",
            heading: "Total Payout – What You Should Know",
            childData: [
                {
                    id: 1,
                    text: "<p><b>Total payout = principal + interest.</b> It shows the real cost of your loan, not just EMI.</p>"
                },
                {
                    id: 2,
                    text: "<p>A ₹50L loan over 20 years could mean a <b>total payout of ₹90L+</b>. Double-check before committing.</p>"
                },
                {
                    id: 3,
                    text: "<p><b>Shorter tenures</b> dramatically reduce total payout, even if EMIs are higher.</p>"
                },
                {
                    id: 4,
                    text: "<p>Prepayments lower your total payout by cutting down <b>future interest obligations</b>.</p>"
                },
                {
                    id: 5,
                    text: "<p>Always evaluate <b>total payout vs. property appreciation</b> to judge investment viability.</p>"
                },
            ]
        },
        {
            id: 4,
            title: "Loan Term Visual ",
            description: "how long you’ll be in repayment mode",
            heading: "Loan Term Visual – What You Should Know",
            childData: [
                {
                    id: 1,
                    text: "<p>The visual shows how <b>EMI components shift over time</b>. Interest dominates early, principal later.</p>"
                },
                {
                    id: 2,
                    text: "<p>Helps you identify <b>ideal prepayment windows</b>. Earlier = greater savings.</p>"
                },
                {
                    id: 3,
                    text: "<p>See how reducing tenure affects your <b>interest outgo and repayment timeline</b> instantly.</p>"
                },
                {
                    id: 4,
                    text: "<p>Use it to plan major life goals, know when your <b>loan-free milestone</b> is coming.</p>"
                },
                {
                    id: 5,
                    text: "<p>Great tool to <b>stress-test different scenarios</b> before finalizing your loan structure.</p>"
                },
            ]
        },

    ];

    //data for don't calibrate your loan
    const dontCalibrateYourLoan = [
        {
            desc: "Don’t chase the absolute maximum eligibility that banks dangle; “stretching” today can feel suffocating tomorrow"
        },
        {
            desc: "Don’t be seduced by teaser rates that jump sharply after 12–24 months—run the calculator with post teaser rates."
        },
        {
            desc: "Don’t ignore ancillary costs (registration, GST on under construction property, maintenance deposits). They’re paid upfront, not financed."
        },
        {
            desc: "Don’t extend tenure only for a lower EMI while planning “I’ll pre pay later.” If discipline slips, you’ll bleed interest for decades."
        },
        {
            desc: "Don’t pick a lender solely on EMI; compare processing fees, foreclosure charges, rate reset frequency, and customer service ratings."
        }
    ];

    //Interpreating your data result 
    const intepreatingYourResult = [
        {
            title: "If EMI feels tight ",
            desc: "consider a larger down payment or longer tenure (but note total interest jump).",
            childData: [
                {
                    id: 1,
                    text: "<p>Increase your <b>down payment</b> to reduce the loan amount and lower your monthly payments.</p>"
                },
                {
                    id: 2,
                    text: "<p>Opt for a <b>slightly longer tenure</b>, but only if you're disciplined about future prepayments.</p>"
                },
                {
                    id: 3,
                    text: "<p>Review all existing EMIs. <b>Consolidate or close small debts</b> to free up cash.</p>"
                },
                {
                    id: 4,
                    text: "<p>Consider <b>joint loans</b> to boost eligibility and ease the burden.</p>"
                },
                {
                    id: 5,
                    text: "<p>Delay purchase if needed. <b>Financial comfort beats rushed ownership.</b></p>"
                },
            ]
        },
        {
            title: "If total interest shocks you ",
            desc: "target aggressive pre payments. Even one extra EMI a year can shave multiple years off.",
            childData: [
                {
                    id: 1,
                    text: "<p>Choose a <b>shorter tenure.</b> It significantly reduces interest paid over time.</p>"
                },
                {
                    id: 2,
                    text: "<p>Plan for <b>aggressive prepayments,</b> especially in the first 5 years.</p>"
                },
                {
                    id: 3,
                    text: "<p>Increase your <b>EMI slightly</b> if your budget allows. It cuts interest fast.</p>"
                },
                {
                    id: 4,
                    text: "<p>Avoid loans with <b>teaser rates</b> that spike later.</p>"
                },
                {
                    id: 5,
                    text: "<p>Use the shock as a trigger to <b>negotiate better terms or reconsider the loan amount.</b></p>"
                },
            ]
        },
        {
            title: "If the calculator shows affordability ",
            desc: "still stress test: add 1–1.5 % to the rate and see if EMI remains comfortable.",
            childData: [
                {
                    id: 1,
                    text: "<p>Still perform a <b>stress test</b> by adding 1–1.5% to the interest rate. Future hikes are real.</p>"
                },
                {
                    id: 2,
                    text: "<p>Don’t stretch to your max. Leave room for <b>emergencies and future goals.</b></p>"
                },
                {
                    id: 3,
                    text: "<p>Consider <b>shortening the tenure</b> to save on interest while it’s affordable.</p>"
                },
                {
                    id: 4,
                    text: "<p>Use your position to <b>negotiate better terms</b> with lenders.</p>"
                },
                {
                    id: 5,
                    text: "<p>Plan <b>prepayments early</b> to close the loan more quickly and affordably.</p>"
                },
            ]
        },
    ];

    const homeLoanFAQs = EMI_CALCULATOR_FAQ_ITEMS;


    function createData(guideLines, whyItMetters) {
        return { guideLines, whyItMetters };
    }


    //Defining rows for the table
    const rows = [
        createData("Keep EMI ≤35% of net monthly income", "Leaves room for lifestyle costs, emergencies, and new goals."),
        createData("Choose the shortest tenure you can comfortably afford",
            "Choose the shortest tenure you can comfortably afford	Every extra year balloons total interest. A 20 year loan can cost 60–80 % more interest than a 12 year loan."),
        createData("Opt for fixed plus floating or pure floating only if you’re ready for rate swings",
            "Floating rates usually fall faster than they rise, but you must have buffer cash for upward cycles."),
        createData("Schedule an annual 5–10 % principal pre payment",
            "Even modest pre payments in early years knock years off the schedule and slash interest outgo."),
        createData("Build a 3 to 6 month EMI emergency fund",
            "Build a 3 to 6 month EMI emergency fund	Protects your credit score (and peace of mind) during job changes or medical surprises."),
    ];
    const [activeKey, setActiveKey] = useState('0');

    const handleToggle = (key) => {
        setActiveKey(prevKey => (prevKey === key ? null : key));
    };

    const openCalculator = (item) => {
        setShowCalculator(true);
        setInterestRate("");
        setIntrestPayable("");
        setTotalAmountPaid("");
        setLoanAmount("");
        setLoanTenure("");
        setEmi("");
        setTitle(item.heading);
        setChildList(item.childData);
    }

    return (
        <>
            <CommonHeaderBanner image={"contact-banner.jpg"} headerText={"Emi-calculator"} useH1={true} />
            <CommonBreadCrum pageName={"Emi-calculator"} />
            <div className='container'>
                <div className='row'>
                    <div className='col-md-8'>
                        <h2 className='mb-5'>Loan and EMI Calculator</h2>
                        <p className='mb-5'>Buying a home is emotional; financing it is mathematical.
                            Our Loan &amp; EMI Calculator lets you preview the maths before signing
                            on the dotted line. Enter your loan amount, interest rate, and tenure to see:</p>
                        <div className='row'>
                            {dataArray.map((item, index) => (
                                <div key={`${index}-${item.id}`} className={`p-2 col-12 col-sm-6 ${styles.cardHover}`}>
                                    <div className='card p-3' onClick={() => openCalculator(item)}>
                                        <h3 className='text-golden'>{item.title}</h3>
                                        <p>{item.description}</p>
                                        {emi && item.id !== 4 && (
                                            <div className="alert-success mt-4 text-center">
                                                {item.id === 1 && <p className='mb-0 fs-4 fw-bold'>₹{Number(emi).toLocaleString('en-IN')}</p>}
                                                {item.id === 2 && <p className='mb-0 fs-4 fw-bold'>₹{Number(intrestPayable).toLocaleString('en-IN')}</p>}
                                                {item.id === 3 && <p className='mb-0 fs-4 fw-bold'>₹{Number(totalAmountPaid.toFixed(2)).toLocaleString('en-IN')}</p>}
                                            </div>
                                        )}
                                        {emi && item.id === 4 &&
                                            <div className='d-flex justify-content-center align-items-center'>
                                                <div className='text-center'>
                                                    <p className='p-0 m-0 text-danger fw-bold'>{loanTenure}</p>
                                                    <p className='mb-0'>Month(s)</p>
                                                </div>
                                                <PieChart
                                                    series={[
                                                        {
                                                            data: [
                                                                { id: 0, value: intrestPayable, label: 'Total Interest' },
                                                                { id: 1, value: loanAmount, label: 'Principle Amount' },
                                                            ],
                                                        },
                                                    ]}
                                                    width={70}
                                                    height={70}
                                                />
                                            </div>
                                        }
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p>Use the numbers to fine tune your budget, negotiate better
                            terms, or decide whether to pre pay and save interest.</p>

                        <div className='mb-5'>
                            <h2 className='mb-5 '>How to Calibrate Your Loan (DOs)</h2>
                            <TableContainer component={Paper} className='custom-shadow p-3'>
                                <Table aria-label="simple table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}><p className='mb-0 fw-bold'>Guideline</p></TableCell>
                                            <TableCell ><p className='mb-0 fw-bold'>Why It Matters</p></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {rows.map((row, index) => (
                                            <TableRow
                                                key={index}
                                            // sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell component="th" scope="row"
                                                    sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>
                                                    {row.guideLines}
                                                </TableCell>
                                                <TableCell align="left">{row.whyItMetters}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
                        <div className='mb-5'>
                            <h2 className='mb-5'>How Not to Calibrate Your Loan (DON’Ts)</h2>
                            <ol>
                                {dontCalibrateYourLoan.map((item, index) => (
                                    <li key={index} className='mb-3'>{item.desc}</li>
                                ))}
                            </ol>
                        </div>
                        <div className='mb-5'>
                            <h2>Interpreting Your Results</h2>
                            <div>
                                <Accordion className={styles.customAccordion} activeKey={activeKey} onSelect={handleToggle}>
                                    {intepreatingYourResult.map((item, index) => (
                                        <Accordion.Item eventKey={index.toString()} key={index}>
                                            <Accordion.Header as="div">
                                                <div>
                                                    <h3 className='text-golden h5 mb-0'>{`${item.title}${item.desc ? ` ${item.desc}` : ""}`}</h3>
                                                </div>
                                            </Accordion.Header>
                                            {item.childData.map((item, index) => (
                                                // <Accordion.Body key={`${index}_${item.id}`}>{item.text}</Accordion.Body>
                                                <Accordion.Body className={`p-0 ps-3 pt-3 ${styles.childList}`} key={`${index}_${item.id}`}>
                                                    <ul>
                                                        <li><div dangerouslySetInnerHTML={{ __html: item.text }} /></li>
                                                    </ul>
                                                </Accordion.Body>
                                            ))}
                                        </Accordion.Item>
                                    ))}
                                </Accordion>
                            </div>
                        </div>
                        <div className='mb-5'>
                            <h2 className='mb-3'>Next Steps</h2>
                            <ol>
                                <li className='mb-3'>Tweak inputs until you hit a “sweet spot” EMI.</li>
                                <li className='mb-3'>Download/print the amortisation schedule as a negotiation tool with lenders.</li>
                                <li className='mb-3'>Speak with a loan advisor to confirm eligibility and best products.</li>
                            </ol>
                        </div>
                        <div className='mb-5 d-flex'>
                            <p className='h6 mb-0 fw-bold'>Disclaimer:</p>
                            <p className='ms-2 fst-italic'>Figures are estimates for planning only. Actual loan offers depend on lender policies, your credit profile, and prevailing market rates.
                                Always review final sanction letters carefully before commitment.</p>
                        </div>

                    </div>
                    <div className='col-md-4'>
                        <div className="container py-5 custom-shadow my-3 rounded-4 p-3 p-md-5" style={{ maxWidth: '600px', position: 'sticky', top: '100px' }}>
                            <p className='text-center mb-4 text-golden text-uppercase fw-bold'>Calculate here</p>
                            <CalculatorForm
                                emi={emi}
                                interestRate={interestRate}
                                intrestPayable={intrestPayable}
                                loanAmount={loanAmount}
                                loanTenure={loanTenure}
                                setInterestRate={setInterestRate}
                                setLoanAmount={setLoanAmount}
                                setLoanTenure={setLoanTenure}
                                totalAmountPaid={totalAmountPaid}
                                calculateEMI={calculateEMI}
                            />
                        </div>
                    </div>
                </div>
                <Container className="my-5">
                    <h2 className="mb-4 text-center">Home Loan FAQs</h2>
                    <Accordion className={styles.customAccordion} activeKey={activeKey} onSelect={handleToggle}>
                        {homeLoanFAQs.map((item, index) => (
                            <Accordion.Item eventKey={index.toString()} key={item.id}>
                                <Accordion.Header as="div">
                                    <h3 className='h5 mb-0'>{item.question}</h3>
                                </Accordion.Header>
                                <Accordion.Body>{item.answer}</Accordion.Body>
                            </Accordion.Item>
                        ))}
                    </Accordion>
                </Container>
            </div>
            <Modal size='xl' show={showCalculator} onHide={() => setShowCalculator(false)} centered>
                <Modal.Header className={styles.modalHeader} closeButton>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <div className='row'>
                    <div className={`col-md-6 order-2 order-md-1 d-flex justify-content-center align-items-center ${styles.childList}`}>
                        <div className='p-3'>
                            {/* <h3>{title}</h3> */}
                            {childList.map((item, index) => (
                                <ul key={index}>
                                    <li><div dangerouslySetInnerHTML={{ __html: item.text }} /></li>
                                </ul>
                            ))}
                        </div>
                    </div>
                    <div className='col-md-6 order-1 order-md-2'>
                        <div className="container custom-shadow p-3 p-md-5" style={{ maxWidth: '600px', position: 'sticky', top: '100px' }}>
                            <p className='text-center mb-4 text-golden text-uppercase fw-bold'>Calculate here</p>
                            <CalculatorForm
                                emi={emi}
                                interestRate={interestRate}
                                intrestPayable={intrestPayable}
                                loanAmount={loanAmount}
                                loanTenure={loanTenure}
                                setInterestRate={setInterestRate}
                                setLoanAmount={setLoanAmount}
                                setLoanTenure={setLoanTenure}
                                totalAmountPaid={totalAmountPaid}
                                calculateEMI={calculateEMI}
                            />
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}
