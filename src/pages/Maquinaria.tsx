import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Card } from '../components/Card'

type MachineRow = {
  id?: string
  code: string
  name: string
  brand?: string
  model?: string
  category?: string
  location?: string
  status: string
  estado_fisico?: string
}

const emptyForm: MachineRow = {
  code: '',
  name: '',
  brand: '',
  model: '',
  category: '',
  location: '',
  status: 'activo',
  estado_fisico: 'buen_estado',
}

export function Maquinaria() {
  const [items, setItems] = useState<MachineRow[]>([])
  const [form, setForm] = useState<MachineRow>(emptyForm)
  const [editingCode, setEditingCode] = useState<string | null>(null)

  async function load() {
    const { data, error } = await supabase
      .from('machines')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      alert(error.message)
      return
    }

    setItems(data || [])
  }

  useEffect(() => {
    load()
  }, [])

  async function save() {
    if (!form.code || !form.name) {
      return alert('Falta código y nombre')
    }

    const payload = {
      code: form.code,
      name: form.name,
      brand: form.brand || '',
      model: form.model || '',
      category: form.category || '',
      location: form.location || '',
      status: form.status || 'activo',
      estado_fisico: form.estado_fisico || 'buen_estado',
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
    load()

    alert(editingCode ? 'Maquinaria actualizada correctamente' : 'Maquinaria guardada correctamente')
  }

  function editarMaquina(machine: MachineRow) {
    setForm({
      code: machine.code || '',
      name: machine.name || '',
      brand: machine.brand || '',
      model: machine.model || '',
      category: machine.category || '',
      location: machine.location || '',
      status: machine.status || 'activo',
      estado_fisico: machine.estado_fisico || 'buen_estado',
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

    setItems(items.filter((item) => item.code !== code))
    alert('Maquinaria eliminada correctamente')
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Maquinaria</h2>

      <Card>
        <div className="grid md:grid-cols-4 gap-3 mb-4">
          <input
            className="border p-3 rounded"
            placeholder="Código"
            value={form.code}
            disabled={!!editingCode}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />

          <input
            className="border p-3 rounded"
            placeholder="Nombre"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            className="border p-3 rounded"
            placeholder="Marca"
            value={form.brand || ''}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
          />

          <input
            className="border p-3 rounded"
            placeholder="Modelo"
            value={form.model || ''}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
          />

          <input
            className="border p-3 rounded"
            placeholder="Categoría"
            value={form.category || ''}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />

          <input
            className="border p-3 rounded"
            placeholder="Ubicación"
            value={form.location || ''}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />

          <select
            className="border p-3 rounded"
            value={form.status}
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

        <div className="overflow-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2">Código</th>
                <th className="py-2">Nombre</th>
                <th className="py-2">Marca</th>
                <th className="py-2">Modelo</th>
                <th className="py-2">Estado</th>
                <th className="py-2">Estado físico</th>
                <th className="py-2">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {items.map((m) => (
                <tr className="border-b" key={m.id || m.code}>
                  <td className="py-2">{m.code}</td>
                  <td className="py-2">{m.name}</td>
                  <td className="py-2">{m.brand || '-'}</td>
                  <td className="py-2">{m.model || '-'}</td>
                  <td className="py-2">{m.status}</td>
                  <td className="py-2">{m.estado_fisico || '-'}</td>
                  <td className="py-2 flex gap-2">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}