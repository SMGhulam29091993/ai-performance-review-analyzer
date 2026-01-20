import * as XLSX from "xlsx";

export const parseExcel = <T = Record<string, unknown>>(
  file: string | Buffer,
): T[] => {
  const workbook = typeof file === 'string' ? XLSX.readFile(file) : XLSX.read(file, { type: 'buffer' });

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error("Excel file contains no sheets");
  }

  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found in workbook`);
  }

  return XLSX.utils.sheet_to_json<T>(sheet);
};
