# Óptica Visión Clara — Frontend

Interfaz web en **Next.js 16 (App Router) + TypeScript + Tailwind CSS + shadcn/ui** para el
sistema de gestión de óptica.

> Backend (Spring Boot + DAO/JDBC): <URL_REPO_BACKEND>
> Informe del proyecto: en el repositorio del backend, `docs/INFORME.md`

## Funcionalidades

**Cliente:** registro, historial de mediciones (OD/OI), catálogo de aros con filtros por marca,
material, forma y precio, y apartado de aros.

**Vendedor:** panel con alertas de stock bajo, CRUD de aros, lunas y accesorios, búsqueda de clientes,
registro de mediciones y asistente de venta con cálculo automático de subtotal, IGV y total.

## Cómo funciona la sesión

- `app/api/auth/*`: los route handlers llaman al backend y guardan el JWT en una cookie **httpOnly**.
- `app/api/proxy/[...path]`: reenvía las peticiones del navegador al backend con `Authorization: Bearer`.
  El token nunca queda expuesto a JavaScript y no hace falta CORS.
- `src/proxy.ts` (antes *middleware*): redirige según el rol. `/cliente/*` es solo para CLIENTE y
  `/vendedor/*` solo para VENDEDOR.

## Ejecutar en local

Con el backend corriendo en `http://localhost:8080`:

```bash
cp .env.example .env.local
npm install
npm run dev        # http://localhost:3000
```

## Despliegue en Vercel

1. Importar este repositorio en Vercel (framework: Next.js).
2. Definir la variable de entorno `BACKEND_URL=https://<tu-backend>.onrender.com`.
3. Desplegar. Después, en Render, agregar la URL de Vercel a `CORS_ORIGINS`.
