import * as XLSX from 'xlsx';

export async function readExcelFile<T = Record<string, unknown>>(file: File): Promise<T[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheet = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheet];
  return XLSX.utils.sheet_to_json<T>(worksheet, { defval: '' });
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
