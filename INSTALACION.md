# Instalación

Guía para dejar USFQ Store funcionando en una máquina nueva: Node, pnpm, PostgreSQL, variables, migraciones y las dos apps.

El código está en `store/`. Los comandos de esta guía asumen que ya entraste a esa carpeta, salvo cuando se indica otra ruta.

## 1. Requisitos

- **Node.js** 22.12 o superior (también vale 20.19 o superior). El monorepo declara `^20.19.0 || >=22.12.0`.
- **pnpm** 10.11.1 (el campo `packageManager` de `store/package.json`).
- **PostgreSQL** 15 o superior. En este proyecto la base de la entrega está en Supabase; también sirve un Postgres local.
- Git, para clonar el repositorio.

Comprueba las versiones:

```bash
node -v
pnpm -v
```

## 2. Instalar Node.js

Opción recomendada: el instalador LTS de [nodejs.org](https://nodejs.org/) (rama 22).

Si en esta máquina Node ya está en `~/.local/node-v22.20.0` y no aparece en el `PATH`:

```bash
export PATH="$HOME/.local/node-v22.20.0/bin:$PATH"
node -v
```

Agrega esa línea a `~/.zshrc` si quieres que quede en cada terminal.

## 3. Instalar pnpm

Con Node 22, Corepack trae pnpm:

```bash
corepack enable
corepack prepare pnpm@10.11.1 --activate
pnpm -v
```

Tiene que responder `10.11.1`.

## 4. Clonar e instalar dependencias

```bash
git clone https://github.com/paulaahr/supaday.git
cd supaday/store
pnpm install
```

`pnpm install` instala backend y storefront. La primera vez puede tardar varios minutos.

## 5. Variables de entorno

### Backend

```bash
cp apps/backend/.env.template apps/backend/.env
```

Edita `store/apps/backend/.env`:

| Variable | Qué poner |
| --- | --- |
| `DATABASE_URL` | Cadena de Postgres. En Supabase incluye el host, usuario, password y `?sslmode=no-verify`. Pídela al equipo: no está en git. |
| `STORE_CORS` | `http://localhost:8000` (ya viene en la plantilla, junto con el origen de la documentación de Medusa). |
| `ADMIN_CORS` y `AUTH_CORS` | Déjalos como en la plantilla para local. |
| `JWT_SECRET` y `COOKIE_SECRET` | En local pueden quedarse en `supersecret`. |
| `PAYPHONE_DEMO` | `true` para la caja de pagos de la clase. |
| `PAYPHONE_TOKEN` y `PAYPHONE_STORE_ID` | Vacíos mientras el demo esté activo. |
| `PAYPHONE_STOREFRONT_URL` | `http://localhost:8000` |

Ejemplo de Postgres en la misma máquina, con una base ya creada llamada `medusa-backend`:

```bash
DATABASE_URL=postgres://postgres:@localhost:5432/medusa-backend
```

La configuración de Medusa ya acepta SSL con `rejectUnauthorized: false`, que es lo que necesita Supabase.

### Storefront

```bash
cp apps/storefront/.env.template apps/storefront/.env.local
```

`store/apps/storefront/.env.local`:

| Variable | Valor |
| --- | --- |
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | `http://localhost:9000` |
| `NEXT_PUBLIC_DEFAULT_REGION` | `ec` |
| `NEXT_PUBLIC_BASE_URL` | `http://localhost:8000` |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | La key del paso 7. Sin ella la tienda no carga productos. |
| `NEXT_PUBLIC_STRIPE_KEY` | Vacío. Esta entrega no cobra con Stripe. |

## 6. Migrar la base y crear el admin

La base de la entrega ya tiene el catálogo USFQ. Con el `DATABASE_URL` de esa base:

```bash
cd apps/backend
pnpm medusa db:migrate
pnpm medusa user -e admin@medusajs.com -p supersecret
```

Si el usuario `admin@medusajs.com` ya existe, Medusa lo avisa y puedes seguir. El password de la demo es `supersecret`.

`db:migrate` también hay que correrlo cuando alguien nuevo se clona el repo y apunta a esa misma base: aplica migraciones que todavía no estén aplicadas.

## 7. Publishable API key

Arranca solo el backend:

```bash
cd apps/backend
pnpm dev
```

Cuando Medusa esté listo:

1. Abre http://localhost:9000/app.
2. Entra con `admin@medusajs.com` / `supersecret`.
3. Ve a **Settings → Publishable API Keys**.
4. Copia la key (empieza por `pk_`).
5. Pégala en `store/apps/storefront/.env.local`:

```bash
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...
```

Esa key tiene que estar ligada al sales channel de la tienda. La key que crea el seed inicial ya lo está. Si creas una nueva en el admin, asóciale el sales channel antes de usarla.

## 8. Datos de la tienda USFQ

Si `DATABASE_URL` apunta a la base compartida, productos, fotos, regiones, inventario y la oferta del 50% ya están ahí. Puedes saltar al paso 9.

Corre estos scripts solo si hay que reconstruir metadatos (categorías, tallas, precios flash o el provider de pago). Desde `store/apps/backend`, con el `.env` cargado:

```bash
pnpm medusa exec ./src/scripts/ensure-currency-regions.ts
pnpm medusa exec ./src/scripts/seed-payphone-region.ts
pnpm medusa exec ./src/scripts/seed-usfq-taxonomy.ts
pnpm medusa exec ./src/scripts/seed-temu-flash-sale.ts
pnpm medusa exec ./src/scripts/fix-hoodie-inventory.ts
```

Qué hace cada uno:

| Script | Efecto |
| --- | --- |
| `ensure-currency-regions.ts` | Crea la región Americas (Ecuador y Estados Unidos, USD) y el envío estándar si Ecuador todavía no existe. |
| `seed-payphone-region.ts` | Enlaza el provider `pp_payphone_payphone` a las regiones de Ecuador y Estados Unidos. |
| `seed-usfq-taxonomy.ts` | Clasifica el merch existente: categorías, colecciones, descripciones, material y tallas S–XL de la hoodie. |
| `seed-product-prices.ts` | Escribe precios de lista USD y EUR en las variantes. |
| `seed-promo-and-descriptions.ts` | Versión anterior de textos y una lista al 15%. La oferta vigente es la del script flash. |
| `seed-temu-flash-sale.ts` | Deja la lista **Flash campus · oferta limitada** al 50% y el precio tachado. |
| `fix-hoodie-inventory.ts` | La hoodie no bloquea la compra por inventario (`manage_inventory: false`). |

El seed genérico de Medusa crea una tienda de ejemplo (camisetas “Medusa”), no el merch USFQ:

```bash
pnpm medusa exec ./src/migration-scripts/initial-data-seed.ts
```

Úsalo solo en una base vacía, para tener regiones, envíos, impuestos y una publishable key. El catálogo del campus tiene que existir ya en la base, o cargarse desde el admin con los títulos de la tabla del [README](README.md), y después correr `seed-usfq-taxonomy.ts` y `seed-temu-flash-sale.ts`.

## 9. Arrancar en desarrollo

Dos terminales.

**Terminal 1 — backend**

```bash
cd store/apps/backend
pnpm dev
```

Espera el mensaje de que Medusa está listo. Admin: http://localhost:9000/app.

**Terminal 2 — tienda**

```bash
cd store/apps/storefront
pnpm dev
```

Tienda: http://localhost:8000/ec.

Para lanzar las dos a la vez desde `store/`:

```bash
cd store
pnpm dev
```

En desarrollo la tienda usa Turbopack. La primera carga de cada página es más lenta. Para presentar, usa el paso 10.

## 10. Arrancar para la exposición

```bash
cd store/apps/backend
pnpm dev
```

En otra terminal, cuando el backend ya responda:

```bash
cd store/apps/storefront
pnpm build
pnpm start
```

Abre http://localhost:8000/ec una vez, recorre Inicio → Tienda → un producto → Carrito, y deja esa pestaña lista.

## 11. Comprobar que todo funciona

1. http://localhost:8000/ec muestra productos con precio tachado y precio de oferta.
2. La hoodie deja elegir S, M, L o XL. Un peluche no pide talla.
3. El carrito suma el ítem.
4. Checkout → Tarjeta → `4242 4242 4242 4242` → orden confirmada.
5. Esa orden aparece en http://localhost:9000/app → Orders.
6. http://localhost:8000/ec/account permite registrarse e iniciar sesión.

El mapa de cada función está en el [README](README.md).

## Errores frecuentes

- **`Could not read package.json` en `SupaDay`**: el `package.json` está en `store/`.
- **`EADDRINUSE` en 8000 o 9000**: ya hay un proceso en ese puerto. Ciérralo o reutiliza esa terminal.
- **La tienda carga vacía o sin precios**: el backend no está en el puerto 9000, o falta `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` en `.env.local`. Reinicia `pnpm dev` o `pnpm start` después de cambiar esa variable.
- **Error de publishable key**: en el admin, la key tiene que pertenecer al sales channel.
- **No aparece Tarjeta en el checkout**: corre `pnpm medusa exec ./src/scripts/seed-payphone-region.ts` y confirma `PAYPHONE_DEMO=true`.
- **La hoodie no deja elegir talla o no entra al carrito**: corre `seed-usfq-taxonomy.ts` y después `fix-hoodie-inventory.ts`.
- **La oferta no está al 50%**: corre `seed-temu-flash-sale.ts`.
- **Fallo de conexión a la base**: revisa `DATABASE_URL`. En Supabase la cadena lleva `sslmode=no-verify`.
- **La tienda va lenta en la demo**: estás en `pnpm dev`. Usa `pnpm build` y `pnpm start`.
