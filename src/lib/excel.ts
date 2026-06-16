import * as XLSX from 'xlsx';

export async function readExcelFile(file: File, sheetIndex = 0): Promise<any[]> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })

  const selectedSheetName = workbook.SheetNames[sheetIndex]

  if (!selectedSheetName) {
    throw new Error(`No existe la hoja número ${sheetIndex + 1} en el Excel`)
  }

  const worksheet = workbook.Sheets[selectedSheetName]

  return XLSX.utils.sheet_to_json(worksheet, {
    defval: '',
  })
}

export function normalizeMachineRow(row: Record<string, any>) {
  return {
    code: String(row.codigo || row.code || row.Codigo || '').trim(),
    name: String(row.nombre || row.name || row.Nombre || '').trim(),
    brand: String(row.marca || row.brand || '').trim(),
    model: String(row.modelo || row.model || '').trim(),
    serial_number: String(row.serie || row.serial_number || '').trim(),
    category: String(row.categoria || row.category || '').trim(),
    location: String(row.ubicacion || row.location || '').trim(),
    status: String(row.estado || row.status || 'operativa').trim().toLowerCase(),
    notes: String(row.observaciones || row.notes || '').trim()
  };
}
