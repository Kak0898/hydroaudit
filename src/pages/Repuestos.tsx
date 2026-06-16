import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { SparePart } from '../types'
import { Card } from '../components/Card'

export function Repuestos() {
  const [items, setItems] = useState<SparePart[]>([])
  const [form, setForm] = useState<SparePart>({
    code: '',
    name: '',
    stock: 0,
    min_stock: 1,
  })

  async function load() {
    const { data, error } = await supabase
      .from('spare_parts')
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
      .from('spare_parts')
      .upsert(form, { onConflict: 'code' })

    if (error) {
      alert(error.message)
      return
    }

    setForm({
      code: '',
      name: '',
      stock: 0,
      min_stock: 1,
    })

    load()
  }

  async function eliminarRepuesto(code: string) {
    const confirmar = confirm(`¿Seguro que quieres eliminar el repuesto ${code}?`)

    if (!confirmar) return

    const { error } = await supabase
      .from('spare_parts')
      .delete()
      .eq('code', code)

    if (error) {
      alert(error.message)
      return
    }

    setItems(items.filter((item) => item.code !== code))
    alert('Repuesto eliminado correctamente')
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Repuestos</h2>

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
            type="number"
            placeholder="Stock"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
          />

          <input
            className="border p-3 rounded"
            type="number"
            placeholder="Mínimo"
            value={form.min_stock}
            onChange={(e) =>
              setForm({ ...form, min_stock: Number(e.target.value) })
            }
          />

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
              <th className="py-2">Stock</th>
              <th className="py-2">Alerta</th>
              <th className="py-2">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {items.map((r) => (
              <tr className="border-b" key={r.id || r.code}>
                <td className="py-2">{r.code}</td>
                <td className="py-2">{r.name}</td>
                <td className="py-2">{r.stock}</td>
                <td className="py-2">
                  {r.stock <= r.min_stock ? (
                    <span className="text-red-600 font-bold">Bajo stock</span>
                  ) : (
                    'OK'
                  )}
                </td>
                <td className="py-2">
                  <button
                    onClick={() => eliminarRepuesto(r.code)}
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