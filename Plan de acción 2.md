# Plan de acción 2

---

- **Modelo de Negocio y Cobro:** El cliente no tiene liquidez para un costo fijo mensual. Propone un modelo de riesgo compartido (revenue-share) basado en ventas.
- **Fricción Operativa:** El catálogo actual vive en WhatsApp. Hay una ligera fricción en la carga de datos al tener que pasar fotos del celular a la computadora.
 Proteger celosamente la simplicidad del panel pero hacer mobile-first el admin panel y la carga de productos. No agregar campos innecesarios. Mejorar la visibilidad de boton eliminar. Reestructurar el cambio de estado de los productos (Disponible/Vendido)para que solo se maneje desde Admin.
- **Identidad de Marca:** Eliminar los términos "Vintage" y "acustización de estudio". Posicionar el negocio como "Guitarras de gama media y alta" en un "ambiente cálido, sin apuros y distendido".
- **Transparencia de Precios:** Eliminar el modelo de "Consultar precio". Los valores deben ser visibles por defecto en la interfaz.
- **Historia y Confianza:** Reescribir la sección "Nosotros" destacando la trayectoria del negocio desde agosto de 2023.

### Características Deseadas (Backlog Funcional)

- **Contacto Rápido (MVP):** Accesos directos e inmediatos a WhatsApp e Instagram en la página principal. Pueden ser botones flotantes.
- **Estados de Inventario:** Etiquetas visuales (badges) en el frontend para distinguir claramente el stock "Disponible" del "Vendido". Es muy importante al producto vendido en la imagen se le cruce una banda roja elegante con la palabra "vendido".
- **Módulo de Consignaciones:** Una sección dedicada para captar clientes que deseen vender sus propios instrumentos a través de la tienda.
- **Flujo de "Pseudo-Checkout":** Reemplazar el mail de reserva "Reservar/Comprar" en cada instrumento.
    - El flujo transaccional de alta eficiencia y baja fricción debe ser este:
        1. **El Contacto:** El cliente hace clic en "R*eservar* " o “Comprar”en la web. Se abre su WhatsApp con el texto prearmado dinámico según botón, según producto: *"Hola, me interesa “reservar” o “comprar” la Fender Stratocaster (ID: 456) que ví en la web."*
        2. **El Cierre:** El owner chatea, negocia y acuerda el pago "en mano".
        3. **La Actualización (El POST):** El owner abre su panel de administrador, busca la guitarra por nombre o ID, y con un solo clic cambia el estado de "Disponible" a "Vendido".
- **Base de Datos como Auditoría:** Dado que los pagos serán "en mano", el número de veces que presionan los botones de compra y de redes sociales serán la única prueba de que una venta se originó en tu plataforma. Utiliza Supabase no solo para el catálogo, sino para registrar cada una de éstas interacciones.