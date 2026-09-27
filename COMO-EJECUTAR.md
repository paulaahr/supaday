# Cómo ejecutar la tienda USFQ en local

El ecommerce **no está en la raíz** `Documents/SupaDay`. Vive en `store/` y se corre con **pnpm** (no `npm`).

Hay dos apps:

| App | Carpeta | URL |
| --- | --- | --- |
| Backend Medusa (API + admin) | `store/apps/backend` | http://localhost:9000 |
| Storefront Next.js (tienda) | `store/apps/storefront` | http://localhost:8000 |

## Demo en clase (recomendado)

Para que la tienda responda rápido en la presentación:

1. Arranca **primero el backend**, espera a que Medusa esté listo.
2. Arranca el storefront en **modo producción** (más rápido que `pnpm dev`):

```bash
export PATH="$HOME/.local/node-v22.20.0/bin:$PATH"
cd ~/Documents/SupaDay/store/apps/storefront
pnpm build
pnpm start
```

3. Abre **una vez** http://localhost:8000/ec antes de presentar (calienta cache).
4. En el header hay un botón **Admin Medusa** (también en el menú móvil) que abre el login del admin.

Admin Medusa:

- URL: http://localhost:9000/app
- Email: `admin@medusajs.com`
- Password: `supersecret`

Si usas `pnpm dev` en el storefront, la primera carga y cada navegación se sienten más lentas (Turbopack + Strict Mode). Para la demo, preferí `build` + `start`.

## Requisitos

- Node **22** (en esta máquina: `~/.local/node-v22.20.0`)
- pnpm 10
- Postgres (Supabase). `DATABASE_URL` ya está en `store/apps/backend/.env`
- Variables de la tienda en `store/apps/storefront/.env.local`

Si Node no está en el PATH:

```bash
export PATH="$HOME/.local/node-v22.20.0/bin:$PATH"
```

## Arrancar (desarrollo: dos terminales)

**Terminal 1 — backend**

```bash
export PATH="$HOME/.local/node-v22.20.0/bin:$PATH"
cd ~/Documents/SupaDay/store/apps/backend
pnpm dev
```

Espera a que Medusa quede listo. Admin:

- http://localhost:9000/app
- Email: `admin@medusajs.com`
- Password: `supersecret`

**Terminal 2 — tienda**

```bash
export PATH="$HOME/.local/node-v22.20.0/bin:$PATH"
cd ~/Documents/SupaDay/store/apps/storefront
pnpm dev
```

Abre la tienda:

- http://localhost:8000/ec

Ecuador (`/ec`) muestra precios en **USD**. Hay **oferta limitada al 50%** con countdown hasta medianoche Quito.

Desde el header: **Admin Medusa** → inicia sesión con las credenciales de arriba.

Para regenerar precios flash:

```bash
cd ~/Documents/SupaDay/store/apps/backend
pnpm medusa exec ./src/scripts/seed-temu-flash-sale.ts
```


## Taxonomía y tallas

Para reclasificar merch o regenerar tallas de la hoodie:

```bash
cd ~/Documents/SupaDay/store/apps/backend
pnpm medusa exec ./src/scripts/seed-usfq-taxonomy.ts
```

Solo la **Sudadera Hoodie** tiene tallas (S–XL). Peluches, botella, tote, duffle y adorno son talla única.

## Pago Payphone (demo)

En checkout verás **Payphone (demo)** junto al pago manual. Flujo:

1. Agrega un producto → carrito → checkout.
2. Completa dirección y envío.
3. Elige **Payphone (demo)** → Continuar → **Pagar con Payphone**.
4. En la página simulada, pulsa **Aprobar pago** (no cobra dinero real).
5. Deberías llegar a la orden confirmada.

Si reinstalas o cambias regiones, vuelve a enlazar el provider:

```bash
cd ~/Documents/SupaDay/store/apps/backend
pnpm medusa exec ./src/scripts/seed-payphone-region.ts
```

## Arrancar ambas desde `store/`

```bash
export PATH="$HOME/.local/node-v22.20.0/bin:$PATH"
cd ~/Documents/SupaDay/store
pnpm dev
```

Eso lanza backend y storefront a la vez (modo desarrollo). Para demo en clase, usa el flujo de **Demo en clase** arriba.

## Primera vez (ya hecho en este proyecto)

Solo si partes de cero:

```bash
export PATH="$HOME/.local/node-v22.20.0/bin:$PATH"
cd ~/Documents/SupaDay/store
pnpm install

cd apps/backend
# copia .env.template a .env y pon DATABASE_URL (Postgres + ?sslmode=no-verify)
pnpm medusa db:migrate
pnpm medusa user -e admin@medusajs.com -p supersecret
pnpm dev
```

En el admin: **Settings → Publishable API Keys**. Copia la key a `store/apps/storefront/.env.local` como `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`.

La región por defecto de la tienda es `ec` (`NEXT_PUBLIC_DEFAULT_REGION`).

## Errores frecuentes

- **`Could not read package.json` en `Documents/SupaDay`**: estás un nivel arriba. Entra a `store/`.
- **`EADDRINUSE` en 8000 o 9000**: ya hay un `pnpm dev` corriendo. Úsalo o ciérralo.
- **Tienda vacía o sin precios**: el backend no está en `:9000` o falta la publishable key en `.env.local`.
- **Tienda muy lenta**: estás en `pnpm dev`. Para la clase: `pnpm build && pnpm start` en el storefront, con el backend ya caliente, y visita `/ec` una vez.
- **No uses** `npm run dev` en la raíz del repo.

No subas `.env` ni `.env.local` a git: tienen secretos y la URL de la base.
