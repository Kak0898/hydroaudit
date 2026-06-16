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

type SparePartRow = {
  id?: string
  code?: string
  name?: string
  brand?: string
  category?: string
  location?: string
  stock?: number
  min_stock?: number
  unit_price?: number
  unit?: string
  supplier?: string
  notes?: string
}

type DashboardTab = 'maquinaria' | 'repuestos'

function normalizar(value: any) {
  return String(value ?? '').trim().toLowerCase()
}

function numero(value: any) {
  const n = Number(value ?? 0)
  return Number.isFinite(n) ? n : 0
}

const colores = ['#2563eb', '#16a34a', '#f97316', '#dc2626', '#7c3aed', '#0891b2']

export function Dashboard() {
  const [tab, setTab] = useState<DashboardTab>('maquinaria')
  const [machines, setMachines] = useState<MachineRow[]>([])
  const [spareParts, setSpareParts] = useState<SparePartRow[]>([])
  const [loading, setLoading] = useState(true)

  const [filtroMarca, setFiltroMarca] = useState<string | null>(null)
  const [filtroEstado, setFiltroEstado] = useState<string | null>(null)
  const [filtroCategoria, setFiltroCategoria] = useState<string | null>(null)
  const [filtroProveedor, setFiltroProveedor] = useState<string | null>(null)

  async function load() {
    setLoading(true)

    const { data: machinesData, error: machinesError } = await supabase
      .from('machines')
      .select('*')
      .order('created_at', { ascending: false })

    if (machinesError) {
      alert(machinesError.message)
      setLoading(false)
      return
    }

    const { data: sparePartsData, error: sparePartsError } = await supabase
      .from('spare_parts')
      .select('*')
      .order('created_at', { ascending: false })

    if (sparePartsError) {
      alert(sparePartsError.message)
      setLoading(false)
      return
    }

    setMachines(machinesData || [])
    setSpareParts(sparePartsData || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const machineStats = useMemo(() => {
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

  const spareStats = useMemo(() => {
    const total = spareParts.length

    const bajoStock = spareParts.filter((r) => {
      return numero(r.stock) <= numero(r.min_stock) && numero(r.stock) > 0
    }).length

    const sinStock = spareParts.filter((r) => numero(r.stock) <= 0).length

    const valorInventario = spareParts.reduce((acc, r) => {
      return acc + numero(r.stock) * numero(r.unit_price)
    }, 0)

    const porCategoria = spareParts.reduce<Record<string, number>>((acc, r) => {
      const categoria = r.category?.trim() || 'Sin categoría'
      acc[categoria] = (acc[categoria] || 0) + 1
      return acc
    }, {})

    const categoriasData = Object.entries(porCategoria)
      .map(([categoria, cantidad]) => ({ categoria, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)

    const porProveedor = spareParts.reduce<Record<string, number>>((acc, r) => {
      const proveedor = r.supplier?.trim() || 'Sin proveedor'
      acc[proveedor] = (acc[proveedor] || 0) + 1
      return acc
    }, {})

    const proveedoresData = Object.entries(porProveedor)
      .map(([proveedor, cantidad]) => ({ proveedor, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)

    const porUbicacion = spareParts.reduce<Record<string, number>>((acc, r) => {
      const ubicacion = r.location?.trim() || 'Sin ubicación'
      acc[ubicacion] = (acc[ubicacion] || 0) + numero(r.stock)
      return acc
    }, {})

    const ubicacionesData = Object.entries(porUbicacion)
      .map(([ubicacion, stock]) => ({ ubicacion, stock }))
      .sort((a, b) => b.stock - a.stock)

    const criticos = spareParts
      .filter((r) => numero(r.stock) <= numero(r.min_stock))
      .sort((a, b) => numero(a.stock) - numero(b.stock))

    return {
      total,
      bajoStock,
      sinStock,
      valorInventario,
      categoriasData,
      proveedoresData,
      ubicacionesData,
      criticos,
    }
  }, [spareParts])

  const maquinasFiltradas = useMemo(() => {
    return machines.filter((m) => {
      const coincideMarca = filtroMarca ? (m.brand || 'Sin marca') === filtroMarca : true
      const coincideEstado = filtroEstado ? (m.status || 'sin_estado') === filtroEstado : true
      return coincideMarca && coincideEstado
    })
  }, [machines, filtroMarca, filtroEstado])

  const repuestosFiltrados = useMemo(() => {
    return spareParts.filter((r) => {
      const coincideCategoria = filtroCategoria
        ? (r.category || 'Sin categoría') === filtroCategoria
        : true

      const coincideProveedor = filtroProveedor
        ? (r.supplier || 'Sin proveedor') === filtroProveedor
        : true

      return coincideCategoria && coincideProveedor
    })
  }, [spareParts, filtroCategoria, filtroProveedor])

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

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setTab('maquinaria')}
          className={`px-4 py-2 rounded ${
            tab === 'maquinaria'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-200 text-slate-800'
          }`}
        >
          Maquinaria
        </button>

        <button
          onClick={() => setTab('repuestos')}
          className={`px-4 py-2 rounded ${
            tab === 'repuestos'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-200 text-slate-800'
          }`}
        >
          Repuestos
        </button>
      </div>

      {tab === 'maquinaria' && (
        <>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <Card>
              <p className="text-slate-500 text-sm">Total Maquinaria</p>
              <h3 className="text-4xl font-bold mt-2">{machineStats.total}</h3>
            </Card>

            <Card>
              <p className="text-slate-500 text-sm">Máquinas Usadas</p>
              <h3 className="text-4xl font-bold mt-2">{machineStats.usadas}</h3>
            </Card>

            <Card>
              <p className="text-slate-500 text-sm">Buen Estado</p>
              <h3 className="text-4xl font-bold mt-2">{machineStats.buenEstado}</h3>
            </Card>

            <Card>
              <p className="text-slate-500 text-sm">Estado Activo</p>
              <h3 className="text-4xl font-bold mt-2">{machineStats.activas}</h3>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Card>
              <h3 className="text-xl font-bold mb-4">Maquinaria por Marca</h3>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={machineStats.marcasData}>
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
            </Card>

            <Card>
              <h3 className="text-xl font-bold mb-4">Maquinaria por Estado</h3>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={machineStats.estadosData}
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
                      {machineStats.estadosData.map((_, index) => (
                        <Cell
                          key={`machine-cell-${index}`}
                          fill={colores[index % colores.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
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
        </>
      )}

      {tab === 'repuestos' && (
        <>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <Card>
              <p className="text-slate-500 text-sm">Total Repuestos</p>
              <h3 className="text-4xl font-bold mt-2">{spareStats.total}</h3>
            </Card>

            <Card>
              <p className="text-slate-500 text-sm">Bajo Stock</p>
              <h3 className="text-4xl font-bold mt-2 text-orange-600">
                {spareStats.bajoStock}
              </h3>
            </Card>

            <Card>
              <p className="text-slate-500 text-sm">Sin Stock</p>
              <h3 className="text-4xl font-bold mt-2 text-red-600">
                {spareStats.sinStock}
              </h3>
            </Card>

            <Card>
              <p className="text-slate-500 text-sm">Valor Inventario</p>
              <h3 className="text-3xl font-bold mt-2">
                ${spareStats.valorInventario.toLocaleString('es-CL')}
              </h3>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Card>
              <h3 className="text-xl font-bold mb-4">Repuestos por Categoría</h3>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={spareStats.categoriasData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="categoria" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="cantidad"
                      name="Cantidad"
                      fill="#16a34a"
                      cursor="pointer"
                      onClick={(data: any) => {
                        setFiltroCategoria(data.categoria)
                        setFiltroProveedor(null)
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <h3 className="text-xl font-bold mb-4">Repuestos por Proveedor</h3>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spareStats.proveedoresData}
                      dataKey="cantidad"
                      nameKey="proveedor"
                      outerRadius={110}
                      label
                      cursor="pointer"
                      onClick={(data: any) => {
                        setFiltroProveedor(data.proveedor)
                        setFiltroCategoria(null)
                      }}
                    >
                      {spareStats.proveedoresData.map((_, index) => (
                        <Cell
                          key={`spare-cell-${index}`}
                          fill={colores[index % colores.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Card>
              <h3 className="text-xl font-bold mb-4">Stock por Ubicación</h3>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={spareStats.ubicacionesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ubicacion" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="stock" name="Stock" fill="#7c3aed" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <h3 className="text-xl font-bold mb-4">Repuestos Críticos</h3>

              {spareStats.criticos.length === 0 ? (
                <p className="text-slate-500">No hay repuestos críticos.</p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-auto">
                  {spareStats.criticos.map((r) => (
                    <div
                      key={r.id || r.code}
                      className="border rounded-lg p-3 bg-red-50"
                    >
                      <div className="flex justify-between">
                        <strong>{r.code}</strong>
                        <span className="text-red-700 font-bold">
                          Stock: {r.stock}
                        </span>
                      </div>

                      <p>{r.name}</p>

                      <p className="text-sm text-slate-600">
                        Mínimo: {r.min_stock} | Proveedor:{' '}
                        {r.supplier || 'Sin proveedor'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Detalle de Repuestos</h3>

              {(filtroCategoria || filtroProveedor) && (
                <button
                  onClick={() => {
                    setFiltroCategoria(null)
                    setFiltroProveedor(null)
                  }}
                  className="bg-slate-800 text-white px-3 py-1 rounded"
                >
                  Limpiar filtro
                </button>
              )}
            </div>

            <p className="text-sm text-slate-500 mb-4">
              Mostrando {repuestosFiltrados.length} de {spareParts.length} repuestos
            </p>

            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Código</th>
                  <th className="py-2">Nombre</th>
                  <th className="py-2">Categoría</th>
                  <th className="py-2">Stock</th>
                  <th className="py-2">Mínimo</th>
                  <th className="py-2">Proveedor</th>
                  <th className="py-2">Ubicación</th>
                </tr>
              </thead>

              <tbody>
                {repuestosFiltrados.map((r) => (
                  <tr
                    className={`border-b ${
                      numero(r.stock) <= numero(r.min_stock) ? 'bg-red-50' : ''
                    }`}
                    key={r.id || r.code}
                  >
                    <td className="py-2">{r.code}</td>
                    <td className="py-2">{r.name}</td>
                    <td className="py-2">{r.category || '-'}</td>
                    <td className="py-2 font-bold">{r.stock}</td>
                    <td className="py-2">{r.min_stock}</td>
                    <td className="py-2">{r.supplier || '-'}</td>
                    <td className="py-2">{r.location || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  )
}

export const DashboardPage = Dashboard