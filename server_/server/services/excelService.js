import XLSX from 'xlsx';
import fs from 'fs';

/**
 * Validate and parse an Excel file (.xlsx, .xls) sheet-by-sheet.
 * 
 * @param {string} filePath - Absolute or relative path to physical Excel file
 * @returns {{ sheetsCount: number, rowsCount: number, sheetsData: Array<{ sheetName: string, headers: Array<string>, rows: Array<Object> }> }}
 */
export const parseExcelWorkbook = (filePath) => {
  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error('Excel file does not exist at specified path.');
  }

  const fileStats = fs.statSync(filePath);
  if (fileStats.size === 0) {
    throw new Error('The uploaded Excel file is empty (0 bytes).');
  }

  let workbook;
  try {
    // Read file into SheetJS workbook using XLSX.readFile with performance flags
    workbook = XLSX.readFile(filePath, { dense: true, cellFormulas: false, cellHTML: false, cellStyles: false, cellDates: false });
  } catch (err) {
    throw new Error(`Failed to parse Excel workbook: ${err.message || 'Corrupted or invalid format.'}`);
  }

  if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('Workbook contains no worksheets.');
  }

  const sheetsData = [];
  let totalUsableRows = 0;

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet || !worksheet['!ref']) {
      // Empty sheet without range bounds
      continue;
    }

    // Convert sheet to JSON matrix (header: 1 gets 2D array of raw values)
    const rawMatrix = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      raw: false,
      defval: null,
      blankrows: false
    });

    if (!rawMatrix || rawMatrix.length === 0) {
      continue;
    }

    // Find first non-empty row as header row
    let headerRowIndex = -1;
    let headers = [];

    for (let r = 0; r < rawMatrix.length; r++) {
      const row = rawMatrix[r];
      if (Array.isArray(row) && row.some((val) => val !== null && val !== undefined && String(val).trim() !== '')) {
        headerRowIndex = r;
        headers = row.map((h, colIdx) => (h !== null && h !== undefined && String(h).trim() !== '' ? String(h).trim() : `Column_${colIdx + 1}`));
        break;
      }
    }

    if (headerRowIndex === -1 || headers.length === 0) {
      // Sheet contains no valid headers or text
      continue;
    }

    const rows = [];
    // Process data rows following header row
    for (let r = headerRowIndex + 1; r < rawMatrix.length; r++) {
      const rowCells = rawMatrix[r];
      if (!Array.isArray(rowCells)) continue;

      const rowData = {};
      const keyValuesText = [];
      let hasMeaningfulData = false;

      for (let c = 0; c < headers.length; c++) {
        const header = headers[c];
        let cellVal = rowCells[c];

        // Preserve 0 and 0.0 numeric values, do not convert 0 to null/empty string!
        if (cellVal === 0 || cellVal === '0') {
          cellVal = 0;
        } else if (cellVal === null || cellVal === undefined || String(cellVal).trim() === '') {
          cellVal = null;
        } else {
          cellVal = typeof cellVal === 'string' ? cellVal.trim() : cellVal;
        }

        if (cellVal !== null) {
          hasMeaningfulData = true;
          rowData[header] = cellVal;
          keyValuesText.push(`${header}: ${cellVal}`);
        }
      }

      if (!hasMeaningfulData || keyValuesText.length === 0) {
        // Skip empty rows
        continue;
      }

      // 1-indexed row number in actual sheet
      const actualRowNumber = r + 1;
      const searchableText = keyValuesText.join('\n');

      rows.push({
        rowNumber: actualRowNumber,
        data: rowData,
        headers,
        text: searchableText,
        keywords: Object.values(rowData).map((v) => String(v).toLowerCase().trim())
      });
    }

    if (rows.length > 0) {
      const trimmedRows = rows.slice(0, 2000);
      console.log(`[EXCEL] Sheet '${sheetName}': Extracted ${trimmedRows.length} usable rows (total: ${rows.length}, ${headers.length} columns)`);
      sheetsData.push({
        sheetName: sheetName.trim(),
        headers,
        rows: trimmedRows
      });
      totalUsableRows += trimmedRows.length;
    }
  }

  if (sheetsData.length === 0 || totalUsableRows === 0) {
    throw new Error('Excel workbook contains no usable data or valid worksheets.');
  }

  return {
    sheetsCount: sheetsData.length,
    rowsCount: totalUsableRows,
    sheetsData
  };
};
