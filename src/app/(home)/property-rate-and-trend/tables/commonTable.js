import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useEffect, useState } from 'react';
import './citydata.css';
export default function CommonTableForInsight({ insightData = [] }) {

    const [defaultAggregationFrom, setDefaultAggregationFrom] = useState("1Yr");
    const [defaultCategory, setDefaultCategory] = useState("All");
    const [cityPriceList, setCityPriceList] = useState([]);
    const [tableHeaders, setTableHeaders] = useState([]);
    const [activeCat, setActiveCat] = useState(0);
    const [activeIndex, setActiveIndex] = useState(2);

    // handling changing data of the table
    const getAggregationFromData = async (value, index) => {
        setDefaultAggregationFrom(value);
        fetchAllData(defaultCategory, value);
        setActiveIndex(index);
    }

    // handling changing data of the table according to category
    const getCategoryWiseData = async (value, index) => {
        setDefaultCategory(value);
        fetchAllData(value, defaultAggregationFrom);
        setActiveCat(index);
    }

    const fetchAllData = (category = 'All', aggregationFrom = '1Yr') => {
        if (category === 'NewSale') {
            category = 'New Sale';
        }
        const allData = insightData?.formattedData || [];
        const filteredData = allData.find(item => item.categoryDisplayName === category);
        const headers = filteredData?.headers;
        const aggregationData = filteredData?.aggregationFromList || [];
        const aggregationFilteredData = aggregationData?.find(item => item.aggregationFromDisplayName === aggregationFrom)?.details;
        setCityPriceList(aggregationFilteredData);
        setTableHeaders(headers);
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const renderProjectInfo = (row) => {
        switch (true) {
            case !!row.projectName:
                return (
                    <div>
                        <p className="m-0 fw-semibold">{row.projectName}</p>
                        {row.noOfProjects}
                    </div>
                );
            case !!row.microMarket:
                return (
                    <div>
                        <p className="m-0 fw-semibold">{row.microMarket}</p>
                        {row.noOfProjects}
                    </div>
                );
            case !!row.developerName:
                return (
                    <div>
                        <p className="m-0 fw-semibold">{row.developerName}</p>
                    </div>
                )
            default:
                return (
                    <div>
                        <p className="m-0 fw-semibold">{row.location}</p>
                        {row.noOfProjects}
                    </div>
                );
        }
    };

    const randerChangeValue = (value) => {
        const stringValue = String(value);
        if (stringValue.startsWith('-')) {
            return <div className='text-danger fw-bold'>{value}</div>
        } else {
            return <div className='text-success fw-bold'>{value}</div>
        }
    }
    return (
        <>
            <div className="insight-property-rate-filter">
                <div className="insight-property-rate-filter-child">
                    {["All", "NewSale", "Resale"].map((item, index) => (
                        <p
                            key={`${item}-${index}`}
                            className={`${activeCat === index
                                ? "insight-property-rate-filter-child-active"
                                : ""
                                } cursor-pointer`}
                            onClick={() => getCategoryWiseData(item, index)}
                        >
                            {item}
                        </p>
                    ))}
                </div>
                <div className="insight-property-rate-filter-child">
                    {["3M", "6M", "1Yr"].map((item, index) => (
                        <p
                            key={`${item}-${index}`}
                            className={`${activeIndex === index
                                ? "insight-property-rate-filter-child-active"
                                : ""
                                } cursor-pointer`}
                            onClick={() =>
                                getAggregationFromData(item, index)
                            }
                        >
                            {item}
                        </p>
                    ))}
                </div>
            </div>
            <TableContainer
                component={Paper}
                sx={{ maxHeight: "450px" }}
            >
                <Table stickyHeader aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            {tableHeaders?.map((item, index) => (
                                <TableCell
                                    key={`${item}-${index}`}
                                    className="fw-bold bg-success text-white"
                                >
                                    {item.headerDisplayName}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {cityPriceList?.map((row, index) => (
                            <TableRow
                                key={`${row.city}_${index}`}
                                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                            >
                                <TableCell component="th" scope="row">
                                    {renderProjectInfo(row)}
                                </TableCell>
                                <TableCell><div className='fw-bold'>{row.noOfTransactions}</div></TableCell>
                                {tableHeaders.length > 2 && <TableCell><div className='fw-bold'>{row.currentRate}</div></TableCell>}
                                {tableHeaders.length > 3 && <TableCell>{randerChangeValue(row.changeValue)}</TableCell>}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}