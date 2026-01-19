# Guía de Usuario - CorePro

## Introducción

CorePro es un sistema de gestión administrativa diseñado para facilitar el control de ventas, stock y gastos en organizaciones sin fines de lucro.

## Acceso al Sistema

### Inicio de Sesión

1. Abrir el navegador web (Chrome, Firefox, Edge, Safari)
2. Ingresar la URL del sistema: `https://tu-dominio.vercel.app`
3. Ingresar tu **email** y **contraseña**
4. Click en **Iniciar Sesión**

**Nota**: Si olvidaste tu contraseña, contacta al administrador del sistema.

---

## Navegación Principal

Al iniciar sesión, verás el menú lateral izquierdo con las siguientes opciones:

- **Dashboard**: Resumen general
- **Ventas**: Registro de ingresos
- **Stock**: Control de inventario
- **Gastos**: Registro de gastos
- **Cerrar Sesión**: Salir del sistema

---

## Dashboard (Pantalla Principal)

El Dashboard muestra un resumen rápido de la situación actual:

### Tarjetas Principales

1. **Ingresos del Mes**: Total de ventas del mes actual
2. **Gastos del Mes**: Total de gastos del mes actual
3. **Saldo Neto**: Diferencia entre ingresos y gastos
4. **Stock Crítico**: Cantidad de productos sin stock o con stock bajo

### Tablas Informativas

- **Productos con Stock Bajo**: Lista de productos que necesitan reposición
- **Últimas Transacciones**: Historial reciente de ventas y gastos

---

## Módulo: Ventas

### Ver Lista de Ventas

1. Click en **Ventas** en el menú lateral
2. Verás una tabla con todas las ventas registradas:
   - Fecha de la venta
   - Concepto (descripción)
   - Medio de pago utilizado
   - Monto

### Estadísticas de Ventas

En la parte superior verás tres tarjetas:
- **Hoy**: Ventas del día actual
- **Este Mes**: Ventas del mes actual
- **Total**: Todas las ventas registradas

### Registrar Nueva Venta

1. Click en el botón **Nueva Venta**
2. Completar el formulario:
   - **Fecha**: Por defecto es hoy, pero puedes cambiarla
   - **Medio de Pago**: Seleccionar entre:
     - Efectivo
     - Transferencia
     - Débito
     - Crédito
   - **Concepto**: Descripción breve (ej: "Venta de consulta médica")
   - **Monto**: Importe en pesos (ej: 5000)
3. Click en **Guardar Venta**
4. La venta aparecerá inmediatamente en la lista

### Ejemplo Práctico

**Escenario**: Registrar una consulta médica pagada en efectivo

1. Click en **Nueva Venta**
2. Fecha: 17/01/2026 (hoy)
3. Medio de Pago: Efectivo
4. Concepto: "Consulta médica - Dr. García"
5. Monto: 8000
6. Click en **Guardar Venta**

---

## Módulo: Stock

### Ver Inventario

1. Click en **Stock** en el menú lateral
2. Verás una tabla con todos los productos:
   - Nombre del producto
   - Descripción
   - Cantidad actual
   - Stock mínimo (nivel de alerta)
   - Estado (color):
     - 🔴 **Crítico**: Sin stock o muy bajo
     - 🟡 **Bajo**: Por debajo del stock mínimo
     - 🟢 **OK**: Stock suficiente

### Buscar Productos

Usar la barra de búsqueda para encontrar productos por nombre:
- Escribir el nombre o parte del nombre
- Los resultados se filtran automáticamente

### Agregar Nuevo Producto

1. Click en **Agregar Producto**
2. Completar el formulario:
   - **Nombre del Producto**: Nombre descriptivo
   - **Descripción**: Detalles adicionales (opcional)
   - **Cantidad Actual**: Stock disponible ahora
   - **Stock Mínimo**: Nivel de alerta (cuando el stock llegue a este número, el sistema lo marcará como "bajo")
   - **Precio Unitario**: Precio de referencia por unidad
3. Click en **Guardar Producto**

### Editar Producto Existente

1. En la lista de productos, click en el ícono de **editar** (lápiz)
2. Modificar los campos necesarios
3. Click en **Actualizar Producto**

**Uso común**: Actualizar la cantidad cuando recibes nuevos insumos o cuando se utilizan.

### Ejemplo Práctico

**Escenario**: Agregar guantes de látex al inventario

1. Click en **Agregar Producto**
2. Nombre: "Guantes de látex - Talle M"
3. Descripción: "Caja x 100 unidades"
4. Cantidad Actual: 50
5. Stock Mínimo: 20
6. Precio Unitario: 15000
7. Click en **Guardar Producto**

Cuando la cantidad baje a 20 o menos, el sistema lo marcará automáticamente como "bajo".

---

## Módulo: Gastos

### Ver Lista de Gastos

1. Click en **Gastos** en el menú lateral
2. Verás:
   - **Total Gastos del Mes**: Suma de todos los gastos del mes actual
   - Tabla con historial de gastos

### Registrar Nuevo Gasto

1. Click en **Nuevo Gasto**
2. Completar el formulario:
   - **Fecha**: Fecha del gasto
   - **Categoría**: Seleccionar una:
     - **Servicios**: Luz, agua, internet, teléfono
     - **Suministros**: Material de oficina, limpieza
     - **Personal**: Salarios, honorarios
     - **Mantenimiento**: Reparaciones, arreglos
     - **Otros**: Gastos diversos
   - **Concepto**: Descripción del gasto
   - **Monto**: Importe en pesos
3. Click en **Guardar Gasto**

### Ejemplo Práctico

**Escenario**: Registrar pago de servicios

1. Click en **Nuevo Gasto**
2. Fecha: 17/01/2026
3. Categoría: Servicios
4. Concepto: "Pago de luz y agua - Enero 2026"
5. Monto: 25000
6. Click en **Guardar Gasto**

---

## Flujo de Trabajo Típico

### Inicio del Día

1. Iniciar sesión en CorePro
2. Revisar el **Dashboard** para ver el estado general
3. Verificar si hay productos con **stock crítico**

### Durante el Día

#### Cuando se realiza una venta:
1. Ir a **Ventas** > **Nueva Venta**
2. Registrar la venta con todos los detalles
3. El sistema actualiza automáticamente el Dashboard

#### Cuando se recibe un gasto:
1. Ir a **Gastos** > **Nuevo Gasto**
2. Registrar el gasto
3. El sistema actualiza el total del mes

#### Cuando se repone stock:
1. Ir a **Stock**
2. Buscar el producto
3. Click en **Editar**
4. Actualizar la **Cantidad Actual**
5. Guardar

### Fin del Día

1. Revisar el Dashboard
2. Verificar que todas las transacciones del día estén registradas
3. Cerrar sesión

---

## Consejos y Mejores Prácticas

### Para Ventas

- Registrar las ventas el mismo día que ocurren
- Usar conceptos claros y descriptivos
- Seleccionar correctamente el medio de pago

### Para Stock

- Actualizar el stock inmediatamente cuando se reciben nuevos insumos
- Configurar el "Stock Mínimo" de forma realista
- Revisar semanalmente los productos con stock bajo

### Para Gastos

- Registrar los gastos apenas se realizan
- Clasificar correctamente por categoría
- Incluir detalles en el concepto (ej: mes que se está pagando)

### General

- Hacer una revisión semanal del Dashboard
- Al final del mes, analizar ingresos vs gastos
- Mantener actualizado el inventario

---

## Preguntas Frecuentes

### ¿Puedo eliminar una venta/gasto registrado por error?

Actualmente el sistema no permite eliminar registros desde la interfaz. Contacta al administrador si necesitas corregir un error.

### ¿Cómo puedo ver las ventas de meses anteriores?

Todas las ventas se muestran en orden cronológico en la sección **Ventas**. Puedes desplazarte por la tabla para ver historial completo.

### ¿El sistema calcula impuestos?

No, el sistema registra los montos exactos ingresados. Los cálculos de impuestos deben hacerse externamente.

### ¿Puedo usar el sistema desde mi celular?

Sí, CorePro es responsive y funciona en dispositivos móviles, tablets y computadoras.

### ¿Los datos están seguros?

Sí, todos los datos están almacenados en Firebase (Google Cloud) con autenticación requerida para acceder.

---

## Soporte

Para asistencia técnica o dudas sobre el uso del sistema, contactar al administrador.

---

**Versión del documento**: 1.0
**Última actualización**: Enero 2026
