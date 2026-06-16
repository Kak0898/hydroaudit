import * as XLSX from 'xlsx'

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

function texto(value: any) {
  return String(value ?? '').trim()
}

function normalizarEstado(value: any) {
  const estado = texto(value).toLowerCase()

  if (estado === 'activa') return 'activo'
  if (estado === 'activo') return 'activo'
  if (estado === 'mantenimiento') return 'mantenimiento'
  if (estado === 'inactivo') return 'inactivo'
  if (estado === 'baja') return 'baja'

  return 'activo'
}

export function normalizeMachineRow(row: any) {
  return {
    code: texto(row.code || row.codigo),
    name: texto(row.name || row.nombre),
    brand: texto(row.brand || row.marca),
    model: texto(row.model || row.modelo),
    serial: texto(row.serial || row.serie),
    category: texto(row.category || row.categoria),
    location: texto(row.location || row.ubicacion),
    status: normalizarEstado(row.status || row.estado),
  }
}