import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Card } from '../components/Card'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'

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

const colores = ['#2563eb', '#16a34a', '#f97316', '#dc2626', '#7c3aed', '#0891b2']

export function Dashboard() {
  const [machines, setMachines] = useState<MachineRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroMarca, setFiltroMarca] = useState<string | null>(null)
  const [filtroEstado, setFiltroEstado] = useState<string | null>(null)

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

    const activas = machines.filter((m) => normalizar(m.status) === 'activo').length

    const porMarca = machines.reduce<Record<string, number>>((acc, machine) => {
      const marca = machine.brand?.trim() || 'Sin marca'
      acc[marca] = (acc[marca] || 0) + 1
      return acc
    }, {})

    const marcasData = Object.entries(porMarca)
      .map(([marca, cantidad]) => ({ marca, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)

    const porEstado = machines.reduce<Record<string, number>>((acc, machine) => {
      const estado = machine.status?.trim() || 'sin_estado'
      acc[estado] = (acc[estado] || 0) + 1
      return acc
    }, {})

    const estadosData = Object.entries(porEstado).map(([estado, cantidad]) => ({
      estado,
      cantidad,
    }))

    return {
      total,
      usadas,
      buenEstado,
      activas,
      marcasData,
      estadosData,
    }
  }, [machines])

  const maquinasFiltradas = useMemo(() => {
    return machines.filter((m) => {
      const coincideMarca = filtroMarca ? (m.brand || 'Sin marca') === filtroMarca : true
      const coincideEstado = filtroEstado ? (m.status || 'sin_estado') === filtroEstado : true
      return coincideMarca && coincideEstado
    })
  }, [machines, filtroMarca, filtroEstado])

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

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card>
          <h3 className="text-xl font-bold mb-4">Maquinaria por Marca</h3>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.marcasData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="marca" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="cantidad"
                  name="Cantidad"
                  fill="#2563eb"
                  cursor="pointer"
                  onClick={(data: any) => {
                    setFiltroMarca(data.marca)
                    setFiltroEstado(null)
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-sm text-slate-500 mt-2">
            Haz clic en una barra para filtrar por marca.
          </p>
        </Card>

        <Card>
          <h3 className="text-xl font-bold mb-4">Maquinaria por Estado</h3>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.estadosData}
                  dataKey="cantidad"
                  nameKey="estado"
                  outerRadius={110}
                  label
                  cursor="pointer"
                  onClick={(data: any) => {
                    setFiltroEstado(data.estado)
                    setFiltroMarca(null)
                  }}
                >
                  {stats.estadosData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colores[index % colores.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <p className="text-sm text-slate-500 mt-2">
            Haz clic en un estado para filtrar la tabla.
          </p>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Detalle de Maquinaria</h3>

          {(filtroMarca || filtroEstado) && (
            <button
              onClick={() => {
                setFiltroMarca(null)
                setFiltroEstado(null)
              }}
              className="bg-slate-800 text-white px-3 py-1 rounded"
            >
              Limpiar filtro
            </button>
          )}
        </div>

        <p className="text-sm text-slate-500 mb-4">
          Mostrando {maquinasFiltradas.length} de {machines.length} máquinas
          {filtroMarca ? ` | Marca: ${filtroMarca}` : ''}
          {filtroEstado ? ` | Estado: ${filtroEstado}` : ''}
        </p>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2">Código</th>
              <th className="py-2">Nombre</th>
              <th className="py-2">Marca</th>
              <th className="py-2">Estado</th>
              <th className="py-2">Estado físico</th>
            </tr>
          </thead>

          <tbody>
            {maquinasFiltradas.map((m) => (
              <tr className="border-b" key={m.id || m.code}>
                <td className="py-2">{m.code}</td>
                <td className="py-2">{m.name}</td>
                <td className="py-2">{m.brand || 'Sin marca'}</td>
                <td className="py-2">{m.status}</td>
                <td className="py-2">{m.estado_fisico || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

export const DashboardPage = Dashboard