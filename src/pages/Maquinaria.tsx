import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Machine } from '../types'
import { Card } from '../components/Card'

export function Maquinaria() {
  const [items, setItems] = useState<Machine[]>([])
  const [form, setForm] = useState<Machine>({
    code: '',
    name: '',
    status: 'activo',
  })

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

    const { error } = await supabase
      .from('machines')
      .upsert(form, { onConflict: 'code' })

    if (error) {
      alert(error.message)
      return
    }

    setForm({
      code: '',
      name: '',
      status: 'activo',
    })

    load()
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
        <div className="grid md:grid-cols-5 gap-3 mb-4">
          <input
            className="border p-3 rounded"
            placeholder="Código"
            value={form.code}
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

          <button
            onClick={save}
            className="bg-blue-600 text-white rounded px-4"
          >
            Guardar
          </button>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2">Código</th>
              <th className="py-2">Nombre</th>
              <th className="py-2">Marca</th>
              <th className="py-2">Estado</th>
              <th className="py-2">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {items.map((m) => (
              <tr className="border-b" key={m.id || m.code}>
                <td className="py-2">{m.code}</td>
                <td className="py-2">{m.name}</td>
                <td className="py-2">{m.brand}</td>
                <td className="py-2">{m.status}</td>
                <td className="py-2">
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
      </Card>
    </div>
  )
}