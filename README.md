# USFQ Store

Tienda de merch del campus de la Universidad San Francisco de Quito. El ecommerce vive en `store/`: un backend **Medusa 2** (API y panel admin) y un storefront **Next.js** (la tienda que ve el cliente).

| Documento | Para qué sirve |
| --- | --- |
| Este README | Qué hace la web y cómo usar cada función |
| [INSTALACION.md](INSTALACION.md) | Instalar Node, pnpm, base de datos y dejar las dos apps corriendo |
| [EXPOSICION.md](EXPOSICION.md) | Guion de la exposición, repartido en 4 personas |

## Aplicaciones

| App | Carpeta | URL |
| --- | --- | --- |
| Backend Medusa (API + admin) | `store/apps/backend` | http://localhost:9000 |
| Tienda Next.js | `store/apps/storefront` | http://localhost:8000 |

La tienda de Ecuador, con precios en USD, está en http://localhost:8000/ec.

El gestor de paquetes del monorepo es **pnpm 10**. Todos los comandos se corren desde `store/` o desde la app correspondiente, nunca desde la carpeta raíz `SupaDay` con npm.

## Demo en clase

1. Arranca el backend y espera a que Medusa quede listo.
2. En el storefront usa el build de producción (responde más rápido que el modo desarrollo):

```bash
cd store/apps/storefront
pnpm build
pnpm start
```

3. Abre una vez http://localhost:8000/ec antes de presentar.
4. En el header, **Admin Medusa** abre el panel en otra pestaña.

Admin:

- URL: http://localhost:9000/app
- Email: `admin@medusajs.com`
- Password: `supersecret`

La instalación completa, las variables de entorno y la base de datos están en [INSTALACION.md](INSTALACION.md).

## Recorrido de una compra

Con backend y tienda encendidos:

1. Entra a http://localhost:8000/ec.
2. El banner rojo muestra la **oferta relámpago del 50%** y una cuenta regresiva hasta la medianoche de Quito (`America/Guayaquil`).
3. En el inicio están el hero del campus, las categorías y el catálogo.
4. Abre un producto. Solo la **Sudadera Hoodie** pide talla (S, M, L, XL). El resto es talla única.
5. Agrégalo al carrito. El contador del header se actualiza.
6. Entra a **Carrito**. Ahí puedes cambiar cantidades, quitar ítems y escribir un código de promoción si existe uno en el admin.
7. Continúa al checkout. Puedes comprar como invitado.
8. Completa la dirección de envío y elige el método de envío.
9. En el pago elige **Tarjeta**. El botón abre la caja local en `/ec/payphone-demo`.
10. Usa `4242 4242 4242 4242`, una fecha futura, cualquier CVC de 3 dígitos y un nombre. La compra se aprueba y vuelves a la orden confirmada.
11. Un número que termina en `0002` se rechaza. Puedes intentar con otra tarjeta. Esta caja no llama a Payphone y no cobra dinero.
12. La orden queda en el admin: **Orders**.

## Funciones de la tienda

### Inicio, tienda y catálogo

- **Inicio** (`/ec`): identidad USFQ, oferta del 50% y acceso a colecciones.
- **Tienda** (`/ec/store`): listado de productos, con orden.
- **Categorías** (también en el footer):
  - `/ec/categories/peluches`
  - `/ec/categories/ropa`
  - `/ec/categories/accesorios`
  - `/ec/categories/bebidas`
  - `/ec/categories/decoracion`
- **Colecciones**:
  - `/ec/collections/peluches-usfq`
  - `/ec/collections/campus-essentials`
  - `/ec/collections/ropa-usfq`
- **Ficha de producto**: fotos, descripción, precio tachado y precio de oferta, variantes y agregar al carrito.
- **País y moneda**: el selector del header cambia la región. Ecuador (`/ec`) y Estados Unidos (`/us`) usan USD. Las regiones de Europa del seed usan EUR. La región por defecto es `ec`.

### Carrito y checkout

- Carrito en `/ec/cart`: cantidades, eliminar, código de promoción y resumen.
- Checkout en `/ec/checkout`: dirección, envío, pago y revisión.
- Envío de la región Americas: **Standard Shipping Americas** (tarifa plana de referencia 10 USD, entrega en 2–3 días).
- Pago **Tarjeta**: provider Payphone en modo demo (`PAYPHONE_DEMO=true`).
- También puede aparecer el pago manual del sistema. Para la demo usa Tarjeta.

### Cuenta de cliente

La cuenta está en http://localhost:8000/ec/account. Desde el carrito también hay un acceso para iniciar sesión.

- Registrarse e iniciar sesión.
- Perfil: nombre, email, teléfono y contraseña.
- Libreta de direcciones.
- Historial de pedidos y detalle de cada orden.
- Verificación de cuenta (`/ec/verify-account`).
- Transferir una orden a otra cuenta, desde el detalle del pedido.
- Cerrar sesión.

### Admin Medusa

http://localhost:9000/app con `admin@medusajs.com` / `supersecret`.

Desde ahí se opera el comercio que la tienda consume:

- **Products**: editar merch, variantes, precios e inventario.
- **Orders**: ver la orden que acaba de confirmar el checkout.
- **Customers**: cuentas creadas en la tienda.
- **Promotions**: códigos que el carrito acepta en “Añadir código de promoción”.
- **Settings → Regions**: Ecuador y Estados Unidos en USD, providers de pago.
- **Settings → Publishable API Keys**: la key que la tienda necesita en `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`.
- El botón **Admin Medusa** del header y del menú móvil abre este login.

## Catálogo

El catálogo vive en PostgreSQL. Estos títulos son los que reconocen los scripts de taxonomía y de oferta:

| Producto | Categoría | Tallas | Precio de lista USD | Oferta 50% USD |
| --- | --- | --- | --- | --- |
| Peluche cerdito USFQ | Peluches | Única | 29.90 | 14.95 |
| Peluche dragón | Peluches | Única | 34.90 | 17.45 |
| Tote bag de lienzo USFQ dragón | Accesorios | Única | 22.90 | 11.45 |
| Botella térmica acero inoxidable USFQ | Bebidas | Única | 39.90 | 19.95 |
| Adorno casita de cerámica USFQ | Decoración | Única | 36.90 | 18.45 |
| Maletín deportivo duffle USFQ | Accesorios | Única | 59.90 | 29.95 |
| Sudadera hoodie roja USFQ | Ropa | S, M, L, XL | 69.90 | 34.95 |

Hay precios equivalentes en EUR para las regiones europeas. La lista de precios activa se llama **Flash campus · oferta limitada**.

## Arquitectura

```text
SupaDay/
├── README.md                 # este documento
├── INSTALACION.md
├── EXPOSICION.md
└── store/                    # monorepo (pnpm + Turborepo)
    ├── apps/backend/         # Medusa 2.21 — API, admin, módulo Payphone, scripts
    └── apps/storefront/      # Next.js 15 — tienda en el puerto 8000
```

El storefront habla con la API de Medusa usando la publishable key. El módulo de pago está en `store/apps/backend/src/modules/payphone`. Con `PAYPHONE_DEMO=true` la autorización ocurre en la caja local. Con `PAYPHONE_DEMO=false` y `PAYPHONE_TOKEN` + `PAYPHONE_STORE_ID` el mismo provider puede preparar una venta real; la entrega de clase usa solo el modo demo.

Rutas propias del pago:

- `POST /store/payphone/prepare` — prepara la sesión.
- `POST /store/payphone/attach` — asocia la sesión al carrito.
- `POST /store/payphone/demo-card` — guarda el resultado de la tarjeta de demostración.
- Storefront: `/[país]/payphone-demo` y `/api/payphone-return`.

## Scripts de datos

Se ejecutan desde `store/apps/backend` con el backend apagado o en otra terminal, y con `.env` ya configurado. Sirven para recomponer datos que ya están en la base. El detalle de cada uno está en [INSTALACION.md](INSTALACION.md).

```bash
cd store/apps/backend
pnpm medusa exec ./src/scripts/ensure-currency-regions.ts
pnpm medusa exec ./src/scripts/seed-usfq-taxonomy.ts
pnpm medusa exec ./src/scripts/seed-product-prices.ts
pnpm medusa exec ./src/scripts/seed-temu-flash-sale.ts
pnpm medusa exec ./src/scripts/seed-payphone-region.ts
pnpm medusa exec ./src/scripts/fix-hoodie-inventory.ts
```

`seed-temu-flash-sale.ts` es el que deja el 50% vigente. `seed-usfq-taxonomy.ts` asigna categorías, colecciones, descripciones y las tallas de la hoodie.

## Secretos

`.env` y `.env.local` no van a git. Ahí están `DATABASE_URL` y la publishable key. Las plantillas versionadas son `store/apps/backend/.env.template` y `store/apps/storefront/.env.template`.
