import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Card } from '../components/Card'

type MachineRow = {
  id?: string
  code: string
  name: string
  conteo?: string
  brand?: string
  model?: string
  color?: string
  serial?: string
  tipo?: string
  anio?: number | null
  location?: string
  status?: string
  estado_fisico?: string
  estado_detalle?: string
  disponibilidad?: string
  tipo_bateria?: string
  alto_bateria?: number
  ancho_bateria?: number
  largo?: number
  altura?: number
}

const emptyForm: MachineRow = {

  code: '',
  name: '',
  conteo: '',
  brand: '',
  model: '',
  color: '',
  serial: '',
  tipo: '',
  anio: null,
  location: '',
  status: 'activo',
  estado_fisico: 'buen_estado',
  estado_detalle: '',
  disponibilidad: 'disponible',
  tipo_bateria: '',
  alto_bateria: 0,
  ancho_bateria: 0,
  largo: 0,
  altura: 0,
}
const PAGE_SIZE = 10

function slug(value: string) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function generarCodigo(form: MachineRow) {
  if (form.code) return form.code

  if (form.conteo) {
    return `MAQ-${String(form.conteo).padStart(3, '0')}`
  }

  if (form.serial) {
    return `SERIE-${slug(form.serial)}`
  }

  return ''
}

function generarNombre(form: MachineRow) {
  if (form.name) return form.name

  return [form.brand, form.model, form.tipo, form.serial]
    .filter(Boolean)
    .join(' ')
}

export function Maquinaria() {
  const [items, setItems] = useState<MachineRow[]>([])
  const [form, setForm] = useState<MachineRow>(emptyForm)
  const [editingCode, setEditingCode] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalRows, setTotalRows] = useState(0)
  const [serieInput, setSerieInput] = useState('')
  const [searchSerie, setSearchSerie] = useState('')
  const [loading, setLoading] = useState(false)

  const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE))

  async function load(currentPage = page, serie = searchSerie) {
    setLoading(true)

    const from = (currentPage - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let query = supabase
      .from('machines')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (serie.trim()) {
      query = query.ilike('serial', `%${serie.trim()}%`)
    }

    const { data, error, count } = await query.range(from, to)

    if (error) {
      alert(error.message)
      setItems([])
      setTotalRows(0)
      setLoading(false)
      return
    }

    setItems(data || [])
    setTotalRows(count || 0)
    setLoading(false)
  }

  useEffect(() => {
    load(page, searchSerie)
  }, [page, searchSerie])

  function buscarSerie() {
    const serie = serieInput.trim()

    setPage(1)
    setSearchSerie(serie)

    if (page === 1 && searchSerie === serie) {
      load(1, serie)
    }
  }

  function limpiarBusqueda() {
    setSerieInput('')
    setPage(1)
    setSearchSerie('')

    if (page === 1 && searchSerie === '') {
      load(1, '')
    }
  }

  async function save() {
    const code = generarCodigo(form)
    const name = generarNombre(form)

    if (!code || !name) {
      return alert('Falta código/conteo y nombre o datos de la máquina')
    }

    const payload = {
      code,
      name,
      conteo: form.conteo || '',
      brand: form.brand || '',
      model: form.model || '',
      color: form.color || '',
      serial: form.serial || '',
      tipo: form.tipo || '',
      anio: form.anio ? Number(form.anio) : null,
      location: form.location || '',
      status: form.status || 'activo',
      estado_fisico: form.estado_fisico || 'buen_estado',
      estado_detalle: form.estado_detalle || '',
      disponibilidad: form.disponibilidad || '',
      tipo_bateria: form.tipo_bateria || '',
      alto_bateria: Number(form.alto_bateria || 0),
      ancho_bateria: Number(form.ancho_bateria || 0),
      largo: Number(form.largo || 0),
      altura: Number(form.altura || 0),
    }

    const { error } = await supabase
      .from('machines')
      .upsert(payload, { onConflict: 'code' })

    if (error) {
      alert(error.message)
      return
    }

    setForm(emptyForm)
    setEditingCode(null)
    load(page, searchSerie)

    alert(editingCode ? 'Maquinaria actualizada correctamente' : 'Maquinaria guardada correctamente')
  }

  function editarMaquina(machine: MachineRow) {
    setForm({
      code: machine.code || '',
      name: machine.name || '',
      conteo: machine.conteo || '',
      brand: machine.brand || '',
      model: machine.model || '',
      color: machine.color || '',
      serial: machine.serial || '',
      tipo: machine.tipo || '',
      anio: machine.anio || null,
      location: machine.location || '',
      status: machine.status || 'activo',
      estado_fisico: machine.estado_fisico || 'buen_estado',
      estado_detalle: machine.estado_detalle || '',
      disponibilidad: machine.disponibilidad || '',
      tipo_bateria: machine.tipo_bateria || '',
      alto_bateria: Number(machine.alto_bateria || 0),
      ancho_bateria: Number(machine.ancho_bateria || 0),
      largo: Number(machine.largo || 0),
      altura: Number(machine.altura || 0),
    })

    setEditingCode(machine.code)
  }

  function cancelarEdicion() {
    setForm(emptyForm)
    setEditingCode(null)
  }

  async function eliminarMaquina(code: string) {
    const confirmar = confirm(`¿Seguro que quieres eliminar la maquinaria ${code}?`)

    if (!confirmar) return

    const { error } = await supabase
      .from('machines')
      .delete()
      .eq('code', code)

    if (error) {
      alert(error.message)
      return
    }

    load(page, searchSerie)
    alert('Maquinaria eliminada correctamente')
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Maquinaria</h2>

      <Card>
        <div className="grid md:grid-cols-5 gap-3 mb-6">
          <input
            className="border p-3 rounded"
            placeholder="Código"
            value={form.code}
            disabled={!!editingCode}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />

          <input
            className="border p-3 rounded"
            placeholder="Conteo"
            value={form.conteo || ''}
            onChange={(e) => setForm({ ...form, conteo: e.target.value })}
          />

          <input
            className="border p-3 rounded"
            placeholder="Nombre"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            className="border p-3 rounded"
            placeholder="Modelo"
            value={form.model || ''}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
          />

          <input
            className="border p-3 rounded"
            placeholder="Color"
            value={form.color || ''}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
          />

          <input
            className="border p-3 rounded"
            placeholder="Marca"
            value={form.brand || ''}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
          />

          <input
            className="border p-3 rounded"
            placeholder="Serie"
            value={form.serial || ''}
            onChange={(e) => setForm({ ...form, serial: e.target.value })}
          />

          <input
            className="border p-3 rounded"
            placeholder="Tipo"
            value={form.tipo || ''}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          />

          <input
            className="border p-3 rounded"
            type="number"
            placeholder="Año"
            value={form.anio || ''}
            onChange={(e) =>
              setForm({ ...form, anio: e.target.value ? Number(e.target.value) : null })
            }
          />

          <input
            className="border p-3 rounded"
            placeholder="Ubicación"
            value={form.location || ''}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />

          <select
            className="border p-3 rounded"
            value={form.status || 'activo'}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="activo">Activo</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="inactivo">Inactivo</option>
            <option value="baja">Baja</option>
          </select>

          <select
            className="border p-3 rounded"
            value={form.estado_fisico || 'buen_estado'}
            onChange={(e) => setForm({ ...form, estado_fisico: e.target.value })}
          >
            <option value="nuevo">Nuevo</option>
            <option value="usado">Usado</option>
            <option value="buen_estado">Buen estado</option>
            <option value="regular">Regular</option>
            <option value="malo">Malo</option>
          </select>

          <input
            className="border p-3 rounded"
            placeholder="Estado detalle"
            value={form.estado_detalle || ''}
            onChange={(e) => setForm({ ...form, estado_detalle: e.target.value })}
          />

          <input
            className="border p-3 rounded"
            placeholder="Disponibilidad"
            value={form.disponibilidad || ''}
            onChange={(e) => setForm({ ...form, disponibilidad: e.target.value })}
          />

          <input
            className="border p-3 rounded"
            placeholder="Tipo de batería"
            value={form.tipo_bateria || ''}
            onChange={(e) => setForm({ ...form, tipo_bateria: e.target.value })}
          />

          <input
            className="border p-3 rounded"
            type="number"
            placeholder="Alto batería"
            value={form.alto_bateria || ''}
            onChange={(e) => setForm({ ...form, alto_bateria: Number(e.target.value) })}
          />

          <input
            className="border p-3 rounded"
            type="number"
            placeholder="Ancho batería"
            value={form.ancho_bateria || ''}
            onChange={(e) => setForm({ ...form, ancho_bateria: Number(e.target.value) })}
          />

          <input
            className="border p-3 rounded"
            type="number"
            placeholder="Largo"
            value={form.largo || ''}
            onChange={(e) => setForm({ ...form, largo: Number(e.target.value) })}
          />

          <input
            className="border p-3 rounded"
            type="number"
            placeholder="Altura"
            value={form.altura || ''}
            onChange={(e) => setForm({ ...form, altura: Number(e.target.value) })}
          />

          <button
            onClick={save}
            className="bg-blue-600 text-white rounded px-4 py-3"
          >
            {editingCode ? 'Actualizar' : 'Guardar'}
          </button>

          {editingCode && (
            <button
              onClick={cancelarEdicion}
              className="bg-slate-700 text-white rounded px-4 py-3"
            >
              Cancelar
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <input
              className="border p-3 rounded"
              placeholder="Buscar por serie"
              value={serieInput}
              onChange={(e) => setSerieInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') buscarSerie()
              }}
            />

            <button
              onClick={buscarSerie}
              disabled={loading}
              className="bg-blue-600 text-white rounded px-4 py-3 disabled:opacity-50"
            >
              Buscar
            </button>

            <button
              onClick={limpiarBusqueda}
              disabled={loading && !serieInput && !searchSerie}
              className="bg-slate-700 text-white rounded px-4 py-3 disabled:opacity-50"
            >
              Limpiar
            </button>
          </div>

          <div className="text-sm text-slate-600">
            {loading ? 'Cargando maquinaria...' : `${totalRows} registro${totalRows === 1 ? '' : 's'}`}
          </div>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2">Conteo</th>
                <th className="py-2">Código</th>
                <th className="py-2">Modelo</th>
                <th className="py-2">Color</th>
                <th className="py-2">Marca</th>
                <th className="py-2">Serie</th>
                <th className="py-2">Tipo</th>
                <th className="py-2">Año</th>
                <th className="py-2">Ubicación</th>
                <th className="py-2">Estado</th>
                <th className="py-2">Estado físico</th>
                <th className="py-2">Estado detalle</th>
                <th className="py-2">Disponibilidad</th>
                <th className="py-2">Tipo batería</th>
                <th className="py-2">Alto batería</th>
                <th className="py-2">Ancho batería</th>
                <th className="py-2">Largo</th>
                <th className="py-2">Altura</th>
                <th className="py-2">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {!loading && items.map((m) => (
                <tr className="border-b" key={m.id || m.code}>
                  <td className="py-2">{m.conteo || '-'}</td>
                  <td className="py-2">{m.code}</td>
                  <td className="py-2">{m.model || '-'}</td>
                  <td className="py-2">{m.color || '-'}</td>
                  <td className="py-2">{m.brand || '-'}</td>
                  <td className="py-2">{m.serial || '-'}</td>
                  <td className="py-2">{m.tipo || '-'}</td>
                  <td className="py-2">{m.anio || '-'}</td>
                  <td className="py-2">{m.location || '-'}</td>
                  <td className="py-2">{m.status || '-'}</td>
                  <td className="py-2">{m.estado_fisico || '-'}</td>
                  <td className="py-2">{m.estado_detalle || '-'}</td>
                  <td className="py-2">{m.disponibilidad || '-'}</td>
                  <td className="py-2">{m.tipo_bateria || '-'}</td>
                  <td className="py-2">{m.alto_bateria || '-'}</td>
                  <td className="py-2">{m.ancho_bateria || '-'}</td>
                  <td className="py-2">{m.largo || '-'}</td>
                  <td className="py-2">{m.altura || '-'}</td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => editarMaquina(m)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => eliminarMaquina(m.code)}
                        className="bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && items.length === 0 && (
                <tr>
                  <td className="py-4 text-center text-slate-500" colSpan={19}>
                    No hay maquinaria para mostrar
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td className="py-4 text-center text-slate-500" colSpan={19}>
                    Cargando maquinaria...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 mt-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-slate-600">
            Página {page} de {totalPages}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
              disabled={loading || page <= 1}
              className="bg-slate-700 text-white rounded px-4 py-2 disabled:opacity-50"
            >
              Anterior
            </button>

            <button
              onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
              disabled={loading || page >= totalPages}
              className="bg-slate-700 text-white rounded px-4 py-2 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}