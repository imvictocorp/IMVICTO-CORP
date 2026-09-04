# IMVICTO CORP · Base local sin Supabase

Esta versión reorganiza el sistema para dejar de depender de Supabase y separar correctamente las vistas.

## Estructura

```text
index.html                 Redirecciona según sesión
login.html                 Login independiente
vendedor.html              Vista de vendedores
admin.html                 Vista de administrador
assets/css/tokens.css      Colores y variables visuales
assets/css/base.css        Botones, formularios, modal, utilidades
assets/css/login.css       Estilos solo del login
assets/css/layout.css      Estilos de paneles internos
assets/js/utils.js         Utilidades generales
assets/js/storage.js       Base local con localStorage
assets/js/auth.js          Login local y roles
assets/js/login.js         Lógica de login
assets/js/vendedor.js      Funciones de vendedor
assets/js/admin.js         Funciones de admin
assets/img/logo-imvicto.jpg
```

## Uso inmediato

1. Abrir la carpeta en Visual Studio Code.
2. Abrir `login.html` con Live Server.
3. En el primer acceso, crear el usuario administrador.
4. Entrar al panel admin.
5. Crear usuarios vendedores desde `Usuarios`.
6. Los vendedores entran desde el mismo `login.html` y son enviados a `vendedor.html`.

## Vista vendedor

Incluye:

- Subir venta.
- Crear cliente nuevo desde la venta o usar cliente existente.
- Agendar cita.
- Agendar mantenimiento.
- Ver calendario propio.
- Ver bonos publicados por admin.

## Vista admin

Incluye:

- Clientes.
- Ventas.
- Cuotas agrupadas por cliente.
- Calendario general.
- Exportar Excel.
- Importar clientes desde Excel.
- Crear usuarios admin/vendedor.
- Subir imágenes de bonos.

## Importante

Esta base usa `localStorage`. Sirve para trabajar ya y ordenar la arquitectura, pero no es una base empresarial definitiva.

Limitaciones del modo local:

- Los datos viven en el navegador/dispositivo donde se usan.
- No hay sincronización automática entre computadoras.
- Los archivos adjuntos de venta se guardan como nombres/metadatos, no como archivo real.
- Las imágenes de bonos sí se guardan localmente como datos de imagen.

Cuando definamos la base definitiva, esta estructura puede migrarse a Microsoft Lists/SharePoint, SQLite local, MySQL/PostgreSQL propio o una API privada.
