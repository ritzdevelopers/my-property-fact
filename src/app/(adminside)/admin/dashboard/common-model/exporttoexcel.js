import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "../../_lib/adminToast";

export async function exportTOExcel(dataToExport, fileName) {
    if (dataToExport.length === 0) {
        toast.warning("No data available to export. Try adjusting your filters first.");
        return;
    }

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Enquiries");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(data, fileName+".xlsx");
}
