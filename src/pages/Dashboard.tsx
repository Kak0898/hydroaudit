import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Card } from '../components/Card'

type MachineRow = {
  id?: string
  code?: string
  name?: string
  brand?: string
  status?: string
  estado_fisico?: string
}

function normalizar(value: any) {
  return String(value ?? '').trim().toLowerCase()
}

export function Dashboard() {
  const [machines, setMachines] = useState<MachineRow[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)

    const { data, error } = await supabase
      .from('machines')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    setMachines(data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const stats = useMemo(() => {
    const total = machines.length

    const usadas = machines.filter((m) => {
      const estadoFisico = normalizar(m.estado_fisico)
      return estadoFisico === 'usado' || estadoFisico === 'usada'
    }).length

    const buenEstado = machines.filter((m) => {
      const estadoFisico = normalizar(m.estado_fisico)
      return (
        estadoFisico === 'buen_estado' ||
        estadoFisico === 'buen estado' ||
        estadoFisico === 'bueno'
      )
    }).length

    const activas = machines.filter((m) => {
      return normalizar(m.status) === 'activo'
    }).length

    const porMarca = machines.reduce<Record<string, number>>((acc, machine) => {
      const marca = machine.brand?.trim() || 'Sin marca'
      acc[marca] = (acc[marca] || 0) + 1
      return acc
    }, {})

    const marcasOrdenadas = Object.entries(porMarca)
      .map(([marca, cantidad]) => ({ marca, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)

    return {
      total,
      usadas,
      buenEstado,
      activas,
      marcasOrdenadas,
    }
  }, [machines])

  const maxMarca = Math.max(
    ...stats.marcasOrdenadas.map((m) => m.cantidad),
    1
  )

  if (loading) {
    return (
      <div>
        <h2 className="text-3xl font-bold mb-6">Panel de Control</h2>
        <Card>
          <p>Cargando dashboard...</p>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Panel de Control</h2>

        <button
          onClick={load}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Actualizar
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card>
          <p className="text-slate-500 text-sm">Total Maquinaria</p>
          <h3 className="text-4xl font-bold mt-2">{stats.total}</h3>
        </Card>

        <Card>
          <p className="text-slate-500 text-sm">Máquinas Usadas</p>
          <h3 className="text-4xl font-bold mt-2">{stats.usadas}</h3>
        </Card>

        <Card>
          <p className="text-slate-500 text-sm">Buen Estado</p>
          <h3 className="text-4xl font-bold mt-2">{stats.buenEstado}</h3>
        </Card>

        <Card>
          <p className="text-slate-500 text-sm">Estado Activo</p>
          <h3 className="text-4xl font-bold mt-2">{stats.activas}</h3>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-xl font-bold mb-4">Maquinaria por Marca</h3>

          {stats.marcasOrdenadas.length === 0 ? (
            <p className="text-slate-500">No hay maquinaria registrada.</p>
          ) : (
            <div className="space-y-4">
              {stats.marcasOrdenadas.map((item) => {
                const width = (item.cantidad / maxMarca) * 100

                return (
                  <div key={item.marca}>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{item.marca}</span>
                      <span className="font-bold">{item.cantidad}</span>
                    </div>

                    <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="text-xl font-bold mb-4">Resumen de Estados</h3>

          <div className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span>Total maquinaria registrada</span>
              <strong>{stats.total}</strong>
            </div>

            <div className="flex justify-between border-b pb-2">
              <span>Máquinas usadas</span>
              <strong>{stats.usadas}</strong>
            </div>

            <div className="flex justify-between border-b pb-2">
              <span>Máquinas en buen estado</span>
              <strong>{stats.buenEstado}</strong>
            </div>

            <div className="flex justify-between border-b pb-2">
              <span>Máquinas activas</span>
              <strong>{stats.activas}</strong>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export const DashboardPage = Dashboard