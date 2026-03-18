import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
export default function PropertyRateAndTrendTable({ tableHeaders = [], data = [] }) {
    const renderProjectInfo = (row, headers) => {
        const hasCityHeader = headers.some(h => h.headerDisplayName === 'City Name');
        const hasLocationHeader = headers.some(h => h.headerDisplayName === 'Location');

        if (hasCityHeader) {
            return <div>
                <p className="m-0 fw-semibold">{row.city}</p>
                {row.noOfProjects}
            </div>;
        } else if (hasLocationHeader) {
            return <div>
                <p className="m-0 fw-semibold">{row.location}</p>
                {row.city}
            </div>;
        } else if (row.projectName) {
            return (
                <div>
                    <p className="m-0 fw-semibold">{row.projectName}</p>
                    {row.noOfProjects}
                </div>
            );
        } else if (row.developerName) {
            return <div><p className="m-0 fw-semibold">{row.developerName}</p></div>;
        }
    };

    const randerChangeValue = (value) => {
        const stringValue = String(value); 
        if(stringValue.startsWith('-')){
            return <div className='text-danger fw-bold'>{value}</div>
        }else{
            return <div className='text-success fw-bold'>{value}</div>
        }
    }
    return (
        <>
            <TableContainer
                component={Paper}
                sx={{ maxHeight: 400, overflowY: "auto" }}
            >
                <Table sx={{ minWidth: 650 }} stickyHeader aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            {tableHeaders.map((item, index) => (
                                <TableCell
                                    key={`${item}-${index}`}
                                    className="fw-bold bg-success text-white"
                                >
                                    <div className='fs-5'>{item.headerDisplayName}</div>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row, index) => (
                            <TableRow
                                key={`${row.city}_${index}`}
                                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                            >
                                <TableCell component="th" scope="row">
                                    {renderProjectInfo(row, tableHeaders)}
                                </TableCell>
                                <TableCell><div className='fw-bold'>{row.noOfTransactions}</div></TableCell>
                                {tableHeaders.length >= 3 && row.currentRate && <TableCell><div className='fw-bold'>{row.currentRate}</div></TableCell>}
                                {tableHeaders.length > 3 && <TableCell>{randerChangeValue(row.changeValue)}</TableCell>}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}