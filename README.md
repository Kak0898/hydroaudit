# HydroAudit
Sistema base para inventario y auditoría de empresa de maquinaria hidráulica.

## Funciones
- Inventario de maquinaria hidráulica
- Inventario de repuestos
- Auditorías de inventario, mantención y seguridad
- Importación desde Excel/CSV usando SheetJS
- Conexión a Supabase
- Deploy listo para Vercel

## Instalación
```bash
npm install
cp .env.example .env
npm run dev
```

## Supabase
1. Crear proyecto en Supabase.
2. Ir a SQL Editor.
3. Pegar y ejecutar `supabase/schema.sql`.
4. Activar Authentication con usuarios por invitación.
5. Copiar URL y anon key al `.env`.

## Deploy Vercel
- Subir repo a GitHub.
- Importar en Vercel.
- Agregar variables:
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY
