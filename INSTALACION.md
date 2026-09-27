# Instalación local

USFQ Store se comparte como un zip de la carpeta del proyecto. Quien lo recibe lo descomprime, instala dependencias y lo ejecuta en su computadora.

La tienda queda en http://localhost:8000/ec y el admin en http://localhost:9000/app.

Hace falta internet. Productos, precios y órdenes están en la base compartida (Supabase). Esa conexión ya está escrita en `store/apps/backend/.env`. No hay que instalar PostgreSQL.

## Armar el zip

Incluye la carpeta del proyecto con estos dos archivos ya llenos:

- `store/apps/backend/.env`
- `store/apps/storefront/.env.local`

Empiezan por un punto, así que el Finder puede ocultarlos. Tienen que ir dentro del zip. Si faltan, la otra computadora abre la tienda vacía.

Deja fuera las carpetas generadas. Pesan mucho y no sirven en otra máquina:

- `node_modules`
- `store/apps/storefront/.next`
- `store/apps/backend/.medusa`
- `.turbo`

Desde la carpeta que contiene el proyecto (en esta máquina, `Documents`):

```bash
cd ~/Documents
zip -r USFQ-Store.zip SupaDay \
  -x "*/node_modules/*" "*/.next/*" "*/.medusa/*" "*/.turbo/*" "*/.git/*"
```

Comprueba que los entornos viajaron:

```bash
unzip -l USFQ-Store.zip | grep -E 'apps/(backend/\.env|storefront/\.env\.local)$'
```

Tienen que aparecer esas dos rutas. `.env.template` no las reemplaza.

## Quien recibe el zip

### 1. Requisitos

- **Node.js** 22.12 o superior. También vale 20.19 o superior.
- **pnpm** 10.11.1.
- Internet, para llegar a la base y para `pnpm install`.

```bash
node -v
pnpm -v
```

### 2. Instalar Node.js

Instala la rama 22 LTS desde [nodejs.org](https://nodejs.org/). Cierra y vuelve a abrir la terminal después de instalar.

### 3. Instalar pnpm

```bash
corepack enable
corepack prepare pnpm@10.11.1 --activate
pnpm -v
```

Tiene que responder `10.11.1`.

En Windows, si `corepack` no se reconoce, abre una terminal nueva como usuario normal después de instalar Node. Si sigue fallando:

```bash
npm install -g pnpm@10.11.1
```

### 4. Descomprimir e instalar

Descomprime el zip. Entra a la carpeta `store` que está dentro (el nombre de la carpeta exterior puede ser `SupaDay`):

```bash
cd SupaDay/store
pnpm install
```

La primera instalación tarda varios minutos. Confirma que siguen estos archivos y no los borres ni los reemplaces con la plantilla:

- `apps/backend/.env`
- `apps/storefront/.env.local`

`PAYPHONE_DEMO` en el `.env` del backend debe seguir en `true`. Así la caja de pagos es local y no cobra.

### 5. Arrancar

Dos terminales, las dos dentro de la carpeta descomprimida.

**Terminal 1 — backend**

```bash
cd SupaDay/store/apps/backend
pnpm dev
```

Espera a que Medusa quede listo. Admin:

- http://localhost:9000/app
- Email: `admin@medusajs.com`
- Password: `supersecret`

Si Medusa dice que el usuario ya existe, entra con esa misma clave.

**Terminal 2 — tienda**

```bash
cd SupaDay/store/apps/storefront
pnpm dev
```

Abre http://localhost:8000/ec.

Para lanzar las dos a la vez:

```bash
cd SupaDay/store
pnpm dev
```

En desarrollo la primera carga de cada página es más lenta. Para la exposición, usa el apartado siguiente.

### 6. Arrancar para la exposición

Con el backend ya listo en la terminal 1:

```bash
cd SupaDay/store/apps/storefront
pnpm build
pnpm start
```

Abre http://localhost:8000/ec una vez, recorre Inicio, Tienda, un producto y el Carrito, y deja esa pestaña lista. El recorrido de cada función está en el [README](README.md).

### 7. Comprobar

1. http://localhost:8000/ec muestra productos con precio tachado y precio de oferta.
2. La hoodie deja elegir S, M, L o XL. Un peluche no pide talla.
3. El carrito suma el ítem.
4. Checkout, método **Tarjeta**, número `4242 4242 4242 4242`, una fecha futura y cualquier CVC de 3 dígitos. La orden queda confirmada.
5. Esa orden aparece en http://localhost:9000/app, en **Orders**.
6. http://localhost:8000/ec/account permite registrarse e iniciar sesión.

## Si faltan los archivos de entorno

Cópialos desde la plantilla y pide los valores a quien armó el zip:

```bash
cd SupaDay/store
cp apps/backend/.env.template apps/backend/.env
cp apps/storefront/.env.template apps/storefront/.env.local
```

En `apps/backend/.env` hace falta `DATABASE_URL` de la base compartida, con `?sslmode=no-verify`, y `PAYPHONE_DEMO=true`.

En `apps/storefront/.env.local`:

| Variable | Valor |
| --- | --- |
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | `http://localhost:9000` |
| `NEXT_PUBLIC_DEFAULT_REGION` | `ec` |
| `NEXT_PUBLIC_BASE_URL` | `http://localhost:8000` |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | La key del admin: **Settings → Publishable API Keys** |

Reinicia backend y tienda después de guardar esos archivos.

La primera vez contra una base nueva también haría falta, dentro de `store/apps/backend`:

```bash
pnpm medusa db:migrate
pnpm medusa user -e admin@medusajs.com -p supersecret
```

La base de esta entrega ya está migrada y el admin ya existe. Con el `.env` del zip no hace falta repetirlo.

## Scripts, solo si el catálogo se descuadra

Desde `store/apps/backend`, con el `.env` en su sitio:

```bash
pnpm medusa exec ./src/scripts/ensure-currency-regions.ts
pnpm medusa exec ./src/scripts/seed-payphone-region.ts
pnpm medusa exec ./src/scripts/seed-usfq-taxonomy.ts
pnpm medusa exec ./src/scripts/seed-temu-flash-sale.ts
pnpm medusa exec ./src/scripts/fix-hoodie-inventory.ts
```

| Script | Efecto |
| --- | --- |
| `ensure-currency-regions.ts` | Crea la región Americas (Ecuador y Estados Unidos, USD) y el envío estándar si Ecuador todavía no existe. |
| `seed-payphone-region.ts` | Enlaza el pago con tarjeta a Ecuador y Estados Unidos. |
| `seed-usfq-taxonomy.ts` | Categorías, colecciones, descripciones y tallas S–XL de la hoodie. |
| `seed-temu-flash-sale.ts` | Oferta vigente al 50%, lista **Flash campus · oferta limitada**. |
| `fix-hoodie-inventory.ts` | La hoodie se puede comprar en la demo sin bloquearse por inventario. |

`pnpm medusa exec ./src/migration-scripts/initial-data-seed.ts` crea una tienda de ejemplo de Medusa, no el merch USFQ. Úsalo solo en una base vacía.

## Errores frecuentes

- **`Could not read package.json`**: el comando se corrió en la carpeta exterior. Entra a `store/` o a `store/apps/backend` y `store/apps/storefront`, según el paso.
- **`EADDRINUSE` en 8000 o 9000**: ese puerto ya está ocupado. Cierra la terminal anterior o usa el proceso que ya está corriendo.
- **Tienda vacía o sin precios**: el backend no está en el puerto 9000, o el zip llegó sin `.env.local`. Revisa el apartado de archivos de entorno y reinicia la tienda.
- **No aparece Tarjeta en el checkout**: en el `.env` del backend, `PAYPHONE_DEMO=true`. Si sigue igual, corre `seed-payphone-region.ts`.
- **Fallo de conexión a la base**: hace falta internet y el `DATABASE_URL` del zip. La cadena de Supabase lleva `sslmode=no-verify`.
- **La tienda va lenta en la demo**: estás en `pnpm dev`. En el storefront usa `pnpm build` y `pnpm start`.
