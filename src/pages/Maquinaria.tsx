import { useEffect, useState } from 'react'
import { Eye, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
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
  estado_fisico: 'buen estado',
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

function normalizar(value?: string) {
  return String(value || '').trim().toLowerCase()
}

function mostrarValor(value?: string | number | null) {
  const text = String(value ?? '').trim()

  return text ? text.replace(/_/g, ' ') : '-'
}

function estadoFisicoFormValue(value?: string) {
  return normalizar(value) === 'buen_estado' ? 'buen estado' : value || 'buen estado'
}

function badgeClass(value?: string) {
  const estado = normalizar(value)

  if (estado.includes('activo') || estado.includes('disponible') || estado.includes('buen')) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }

  if (estado.includes('mantenimiento') || estado.includes('regular')) {
    return 'bg-amber-50 text-amber-700 border-amber-200'
  }

  if (estado.includes('inactivo') || estado.includes('baja') || estado.includes('malo')) {
    return 'bg-red-50 text-red-700 border-red-200'
  }

  return 'bg-slate-50 text-slate-700 border-slate-200'
}

function Badge({ value }: { value?: string }) {
  return (
    <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${badgeClass(value)}`}>
      {mostrarValor(value)}
    </span>
  )
}

function DetailItem({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase text-slate-500">{label}</div>
      <div className="mt-1 text-sm text-slate-900">{mostrarValor(value)}</div>
    </div>
  )
}

export function Maquinaria() {
  const [items, setItems] = useState<MachineRow[]>([])
  const [form, setForm] = useState<MachineRow>(emptyForm)
  const [editingCode, setEditingCode] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedMachine, setSelectedMachine] = useState<MachineRow | null>(null)
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

  function nuevaMaquinaria() {
    setForm(emptyForm)
    setEditingCode(null)
    setSelectedMachine(null)
    setShowForm(true)
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
      estado_fisico: form.estado_fisico || 'buen estado',
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
    setShowForm(false)
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
      estado_fisico: estadoFisicoFormValue(machine.estado_fisico),
      estado_detalle: machine.estado_detalle || '',
      disponibilidad: machine.disponibilidad || '',
      tipo_bateria: machine.tipo_bateria || '',
      alto_bateria: Number(machine.alto_bateria || 0),
      ancho_bateria: Number(machine.ancho_bateria || 0),
      largo: Number(machine.largo || 0),
      altura: Number(machine.altura || 0),
    })

    setEditingCode(machine.code)
    setSelectedMachine(null)
    setShowForm(true)
  }

  function cancelarEdicion() {
    setForm(emptyForm)
    setEditingCode(null)
    setShowForm(false)
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
    if (selectedMachine?.code === code) {
      setSelectedMachine(null)
    }
    alert('Maquinaria eliminada correctamente')
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Maquinaria</h2>

      <Card>
        <div className="flex flex-col gap-3 mb-5 md:flex-row md:items-center md:justify-between">
          <button
            onClick={nuevaMaquinaria}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white rounded px-4 py-3"
          >
            <Plus size={18} />
            Nueva maquinaria
          </button>

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
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white rounded px-4 py-3 disabled:opacity-50"
            >
              <Search size={18} />
              Buscar
            </button>

            <button
              onClick={limpiarBusqueda}
              disabled={loading && !serieInput && !searchSerie}
              className="inline-flex items-center justify-center gap-2 bg-slate-700 text-white rounded px-4 py-3 disabled:opacity-50"
            >
              <X size={18} />
              Limpiar
            </button>
          </div>
        </div>

        {showForm && (
          <div className="mb-6 border-b pb-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">
                {editingCode ? 'Editar maquinaria' : 'Nueva maquinaria'}
              </h3>

              <button
                onClick={cancelarEdicion}
                className="inline-flex items-center justify-center rounded border px-3 py-2 text-slate-700"
                title="Cerrar formulario"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid md:grid-cols-5 gap-3">
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
                value={form.estado_fisico || 'buen estado'}
                onChange={(e) => setForm({ ...form, estado_fisico: e.target.value })}
              >
                <option value="nuevo">Nuevo</option>
                <option value="usado">Usado</option>
                <option value="buen estado">Buen estado</option>
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

              <button
                onClick={cancelarEdicion}
                className="bg-slate-700 text-white rounded px-4 py-3"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="mb-3 flex items-center justify-between text-sm text-slate-600">
          <span>{loading ? 'Cargando maquinaria...' : `${totalRows} registro${totalRows === 1 ? '' : 's'}`}</span>
          <span>Página {page} de {totalPages}</span>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2">Conteo</th>
                <th className="py-2">Serie</th>
                <th className="py-2">Marca</th>
                <th className="py-2">Modelo</th>
                <th className="py-2">Tipo</th>
                <th className="py-2">Ubicación</th>
                <th className="py-2">Estado físico</th>
                <th className="py-2">Disponibilidad</th>
                <th className="py-2">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {!loading && items.map((m) => (
                <tr className="border-b hover:bg-slate-50" key={m.id || m.code}>
                  <td className="py-3 font-semibold">{m.conteo || '-'}</td>
                  <td className="py-3">
                    <div className="font-semibold">{m.serial || '-'}</div>
                    <div className="text-xs text-slate-500">{m.code || '-'}</div>
                  </td>
                  <td className="py-3">{m.brand || '-'}</td>
                  <td className="py-3">{m.model || '-'}</td>
                  <td className="py-2">{m.tipo || '-'}</td>
                  <td className="py-2">{m.location || '-'}</td>
                  <td className="py-2"><Badge value={m.estado_fisico} /></td>
                  <td className="py-2"><Badge value={m.disponibilidad} /></td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedMachine(m)}
                        className="inline-flex items-center justify-center rounded border px-3 py-2 text-slate-700"
                        title="Ver detalle"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        onClick={() => editarMaquina(m)}
                        className="inline-flex items-center justify-center rounded bg-yellow-500 px-3 py-2 text-white"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => eliminarMaquina(m.code)}
                        className="inline-flex items-center justify-center rounded bg-red-600 px-3 py-2 text-white"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && items.length === 0 && (
                <tr>
                  <td className="py-4 text-center text-slate-500" colSpan={9}>
                    No hay maquinaria para mostrar
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td className="py-4 text-center text-slate-500" colSpan={9}>
                    Cargando maquinaria...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {selectedMachine && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded bg-white p-6 shadow-xl">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">
                    {selectedMachine.brand || 'Maquinaria'} {selectedMachine.model || ''}
                  </h3>
                  <div className="mt-1 text-sm text-slate-500">
                    Serie {selectedMachine.serial || '-'} - Código {selectedMachine.code || '-'}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedMachine(null)}
                  className="inline-flex items-center justify-center rounded border px-3 py-2 text-slate-700"
                  title="Cerrar detalle"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mb-6 flex flex-wrap gap-2">
                <Badge value={selectedMachine.estado_fisico} />
                <Badge value={selectedMachine.disponibilidad} />
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <DetailItem label="Conteo" value={selectedMachine.conteo} />
                <DetailItem label="Modelo" value={selectedMachine.model} />
                <DetailItem label="Color" value={selectedMachine.color} />
                <DetailItem label="Marca" value={selectedMachine.brand} />
                <DetailItem label="Serie" value={selectedMachine.serial} />
                <DetailItem label="Tipo" value={selectedMachine.tipo} />
                <DetailItem label="Año" value={selectedMachine.anio} />
                <DetailItem label="Ubicación" value={selectedMachine.location} />
                <DetailItem label="Estado físico" value={selectedMachine.estado_fisico} />
                <DetailItem label="Estado detalle" value={selectedMachine.estado_detalle} />
                <DetailItem label="Disponibilidad" value={selectedMachine.disponibilidad} />
                <DetailItem label="Tipo batería" value={selectedMachine.tipo_bateria} />
                <DetailItem label="Alto batería" value={selectedMachine.alto_bateria} />
                <DetailItem label="Ancho batería" value={selectedMachine.ancho_bateria} />
                <DetailItem label="Largo" value={selectedMachine.largo} />
                <DetailItem label="Altura" value={selectedMachine.altura} />
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => editarMaquina(selectedMachine)}
                  className="inline-flex items-center justify-center gap-2 rounded bg-yellow-500 px-4 py-2 text-white"
                >
                  <Pencil size={16} />
                  Editar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 mt-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-slate-600">{totalRows} resultados</div>

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
