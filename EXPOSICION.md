# Exposición — USFQ Store (4 personas)

Guion para cuatro personas. Cada una tiene un bloque, qué debe verse en pantalla y qué no tiene que repetir de las demás.

Tiempo total aproximado: 14 minutos, más preguntas.


| Persona | Bloque                            | Tiempo  |
| ------- | --------------------------------- | ------- |
| 1       | La web: qué es y recorrido        | 3 min   |
| 2       | Backend: Medusa, datos y pagos    | 4 min   |
| 3       | Frontend: tienda y catálogo       | 3.5 min |
| 4       | Frontend: compra, cuenta y cierre | 3.5 min |


Antes de entrar: backend en marcha, storefront con `pnpm build` y `pnpm start`, y [http://localhost:8000/ec](http://localhost:8000/ec) abierto una vez. Credenciales y tarjeta de prueba están al final.

---



## Persona 1 — La web

**En pantalla:** inicio [http://localhost:8000/ec](http://localhost:8000/ec), sin entrar todavía a un producto.

### Qué decir

USFQ Store es la tienda de merch del campus de la Universidad San Francisco de Quito. Un estudiante puede ver el catálogo, elegir producto, pagar y quedar con una orden, y el equipo puede administrar esa misma venta desde un panel.

La tienda abre en Ecuador. La URL lleva `/ec` porque el país define la región, la moneda y los precios. En Ecuador y Estados Unidos los precios están en dólares. El selector del header cambia de país.

Lo que se ve arriba es la oferta de la demo: 50% de descuento en el merch, con una cuenta regresiva que termina a medianoche, hora de Quito. El hero es el campus, en Cumbayá, y desde ahí se entra a las colecciones.

El menú tiene Inicio, Tienda y Carrito. **Admin Medusa** abre el panel interno en otra pestaña. La compra se puede hacer como invitado; la cuenta es opcional y la enseña la persona 4.

El catálogo son siete piezas de merch: dos peluches, tote, botella, casita de cerámica, duffle y la sudadera hoodie. Están agrupadas en Peluches, Ropa, Accesorios, Bebidas y Decoración.

A partir de aquí el resto del equipo entra al cómo: la persona 2 en el servidor y los datos, y las personas 3 y 4 en lo que ve el cliente.

### Qué mostrar, en este orden

1. Banner de oferta y el contador.
2. Hero y el botón **Ver colecciones** (no hace falta hacer clic todavía).
3. Selector de país en el header.
4. Botón **Admin Medusa**, sin iniciar sesión: eso lo abre la persona 2.



### No repetir

Precios fila por fila, tallas, ni el pago. Eso es de las personas 3 y 4.

---



## Persona 2 — Backend

**En pantalla:** al terminar, el admin en [http://localhost:9000/app](http://localhost:9000/app). Al empezar puedes seguir en la tienda y cambiar al admin cuando hables de órdenes y productos.

### Qué decir

Detrás de la tienda hay Medusa 2. Es el backend: API, base de datos y el panel de administración. El storefront de Next.js no guarda productos ni órdenes; le pide todo a Medusa.

La base es PostgreSQL. En la entrega está en Supabase. Ahí viven regiones, productos, variantes, precios, carritos, clientes y órdenes. Las migraciones se aplican con `pnpm medusa db:migrate` dentro de `store/apps/backend`. La cadena de conexión está en `.env` y no se sube a git.

El comercio de la clase se apoya en scripts que dejan los datos listos:

- `ensure-currency-regions.ts` asegura la región Americas: Ecuador y Estados Unidos, en USD, con envío estándar.
- `seed-usfq-taxonomy.ts` clasifica cada producto en su categoría y colección, escribe la descripción y crea las tallas S, M, L y XL solo en la hoodie.
- `seed-temu-flash-sale.ts` publica la lista de precios **Flash campus · oferta limitada**, al 50% sobre el precio de lista.
- `seed-payphone-region.ts` conecta el método Tarjeta a las regiones de Ecuador y Estados Unidos.
- `fix-hoodie-inventory.ts` permite comprar cualquier talla de la hoodie en la demo.

El pago es un módulo propio, `src/modules/payphone`. Medusa lo registra como provider de pago. Con `PAYPHONE_DEMO=true` no sale a la pasarela real: la tienda abre una caja local, valida la tarjeta y autoriza la sesión. Las rutas son `prepare`, `attach` y `demo-card`. Si en otro entorno se apaga el demo y se ponen token y store id, el mismo módulo puede hablar con Payphone. En clase el demo queda encendido y no se cobra.

El admin es la operación del día a día: productos, precios, clientes, promociones y órdenes. La tienda entra con una publishable API key. Sin esa key en el storefront, el catálogo no carga. El login de este panel es `admin@medusajs.com` / `supersecret`.

Cuando la persona 4 confirme una compra, la orden aparece en **Orders**. Eso cierra el círculo: la web muestra, el backend registra.

### Qué mostrar

1. Login del admin.
2. **Products**: un producto USFQ, y en la hoodie las variantes de talla.
3. **Settings → Regions**: Americas / Ecuador, moneda USD.
4. Deja **Orders** a la vista para cuando termine el checkout. No hace falta crear nada a mano.



### No repetir

El diseño de la tienda ni el paso a paso de la caja de tarjeta.

---



## Persona 3 — Frontend: tienda y catálogo

**En pantalla:** la tienda, empezando en [http://localhost:8000/ec](http://localhost:8000/ec). Esta persona maneja el teclado hasta dejar un producto en el carrito.

### Qué decir

El frontend es una app Next.js 15 en `store/apps/storefront`, puerto 8000. Cada URL lleva el país: `/ec` es Ecuador. Next.js pinta las páginas y el SDK de Medusa trae regiones, productos y carrito.

La interfaz usa los colores del campus: negro, blanco y el rojo USFQ. El header es fijo: marca, acceso al admin, país y carrito. El banner de la oferta es un componente que cuenta hasta medianoche de `America/Guayaquil`; el descuento de verdad está en la lista de precios del backend, no solo en el texto del banner.

En el inicio se ven el hero, la franja de categorías y los productos. El footer repite categorías y colecciones: Peluches USFQ, Campus essentials y Ropa USFQ. Esas rutas son `/categories/...` y `/collections/...`.

En la ficha, la página muestra fotos, descripción, precio de lista tachado y precio de oferta. La persona 2 ya explicó de dónde sale ese 50%. Aquí se ve en la tarjeta.

Las variantes dependen del producto. Un peluche, la tote, la botella, la casita y el duffle son talla única: se agregan directo. La sudadera hoodie pide S, M, L o XL. Sin talla, el botón de agregar no completa la variante.

El carrito vive en el header. Al agregar, el contador cambia y se puede abrir el dropdown o ir a `/ec/cart`. En el carrito se cambia la cantidad, se quita un ítem y hay un campo de código de promoción, que Medusa valida contra las promociones del admin.

Dejo el carrito con la hoodie en una talla, listo para el checkout.

### Qué mostrar

1. Inicio: categorías y una tarjeta con los dos precios.
2. Ficha de un peluche: una sola opción, **agregar** y volver.
3. Ficha de la sudadera: elegir una talla y agregarla.
4. Carrito con el ítem, la cantidad y el campo de promoción. No pagues todavía.



### No repetir

La arquitectura de Medusa ni el formulario de la tarjeta.

---



## Persona 4 — Frontend: compra, cuenta y cierre

**En pantalla:** el carrito que dejó la persona 3. Al final, la orden confirmada y, si alcanza el tiempo, la cuenta.

### Qué decir

El checkout está en `/ec/checkout` y se puede completar sin cuenta. El formulario va en este orden: dirección de envío, método de envío y pago. El envío de la región Americas es el estándar, con una tarifa plana.

En el pago se elige **Tarjeta**. Ese método es el provider Payphone en modo demo. Al confirmar, la tienda abre su propia caja, en `/ec/payphone-demo`. Pide nombre, número, vencimiento y CVC. Valida el número con el algoritmo de Luhn, así que tiene que ser un número de tarjeta coherente.

Para aprobar uso `4242 4242 4242 4242`, una fecha futura y un CVC de tres dígitos. La caja muestra la verificación y regresa a la orden confirmada. Si el número termina en `0002`, el banco de la demo rechaza la tarjeta y se puede intentar de nuevo. No hay cargo real.

La orden queda con su número en la tienda. En el admin, en **Orders**, es la misma venta: el frontend solo confirmó lo que el backend ya autorizó.

La cuenta es la otra mitad del cliente. En `/ec/account` alguien se registra o inicia sesión. Dentro puede editar perfil, guardar direcciones y ver sus pedidos. También existe verificación de cuenta y la opción de transferir una orden a otro usuario. Para la demo basta enseñar el login y la lista de pedidos; el invitado ya completó la compra.

Para correrlo en otra computadora se comparte el zip del proyecto. `INSTALACION.md` dice qué archivos de entorno deben ir dentro, cómo instalar Node y pnpm, y cómo levantar el backend con `pnpm dev` y la tienda con `pnpm build` y `pnpm start`.

### Qué mostrar

1. Checkout: una dirección de Ecuador, el envío y **Tarjeta**.
2. Caja demo con `4242 4242 4242 4242`.
3. Página de orden confirmada.
4. Si la persona 2 dejó el admin abierto, señalar esa orden en **Orders**.
5. `/ec/account`: pantalla de registro o de pedidos, un vistazo.



### Cierre (las cuatro, 20 segundos)

Persona 4 puede cerrar: la tienda muestra el merch y cobra en demo; Medusa guarda catálogo, precios y la orden; Next.js es la cara que usa el cliente. Preguntas.

---



## Antes de presentar

- [ ] Backend listo en el puerto 9000.
- [ ] Storefront en producción en el puerto 8000 (`pnpm build` y `pnpm start`).
- [ ] [http://localhost:8000/ec](http://localhost:8000/ec) abierto al menos una vez.
- [ ] Carrito vacío al empezar, para que la persona 3 agregue la hoodie en vivo.
- [ ] El admin inicia sesión con `admin@medusajs.com` / `supersecret`.
- [ ] Tarjeta de aprobación anotada: `4242 4242 4242 4242`.
- [ ] Quien habla no lee este archivo entero: cada persona usa solo su bloque.



## Datos que pueden preguntar


| Pregunta                         | Respuesta corta                                                                              |
| -------------------------------- | -------------------------------------------------------------------------------------------- |
| ¿Dónde está el código?           | `store/apps/backend` y `store/apps/storefront`                                               |
| ¿Qué versiones?                  | Medusa 2.21, Next.js 15, Node 22, pnpm 10                                                    |
| ¿Por qué `/ec`?                  | Código de país de la región. Ecuador, USD                                                    |
| ¿El 50% es real?                 | Sí en la lista de precios del backend. El banner solo muestra el contador                    |
| ¿Hasta cuándo la oferta?         | Medianoche, hora de Quito. El precio sigue en la base hasta que se vuelva a correr el script |
| ¿Se cobra?                       | No. `PAYPHONE_DEMO=true`                                                                     |
| ¿Tarjeta que falla?              | Cualquier número válido que termine en `0002`                                                |
| ¿Quién tiene tallas?             | Solo la sudadera hoodie                                                                      |
| ¿Hace falta cuenta para comprar? | No. El checkout de invitado está habilitado                                                  |


