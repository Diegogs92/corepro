# 🎮 Demo Interactiva - CorePro

## 🚀 Bienvenido a CorePro

Esta es una guía paso a paso para explorar todas las funcionalidades del sistema.

---

## 📍 Paso 1: Acceder al Sistema

### Abre tu navegador en:
```
http://localhost:3002
```

**¿Qué verás?**
- Serás redirigido automáticamente al Dashboard
- No necesitas login (modo demo activado)
- Usuario actual: demo@corepro.com

---

## 🏠 Paso 2: Explorar el Dashboard

### Lo que verás:

#### **Tarjetas de Métricas** (parte superior)
```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Ingresos Mes    │  │ Gastos Mes      │  │ Saldo Neto      │  │ Stock Crítico   │
│ 💰 $32,500      │  │ 📉 $90,500      │  │ 📊 -$58,000     │  │ ⚠️  1           │
└─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘
```

#### **Tabla: Productos con Stock Bajo**
```
Producto              Cantidad    Estado
─────────────────────────────────────────
Jeringas 5ml         0           🔴 Crítico
Barbijos             18          🟡 Bajo
Guantes látex        15          🟡 Bajo
```

#### **Tabla: Últimas Transacciones**
```
Tipo      Concepto                        Fecha        Monto
─────────────────────────────────────────────────────────────
🟢 Ingreso Venta de insumos médicos      17/01/2026   +$12,000
🔴 Gasto   Pago de luz y agua            17/01/2026   -$25,000
```

### ✅ Interacción:
- **Observa** los indicadores de color (verde/amarillo/rojo)
- **Nota** el producto crítico (Jeringas con 0 stock)

---

## 💰 Paso 3: Módulo de Ventas

### Navegar:
1. Click en **"Ventas"** en el menú lateral izquierdo

### Lo que verás:

#### **Tarjetas de Totales**
```
Hoy            Este Mes       Total
$0             $32,500        $32,500
```

#### **Tabla de Ventas Existentes**
```
Fecha        Concepto                      Medio          Monto
───────────────────────────────────────────────────────────────
17/01/2026   Venta de insumos médicos     Transferencia  $12,000
17/01/2026   Consulta médica - Dr. García Efectivo       $8,000
16/01/2026   Donación                     Efectivo       $5,000
16/01/2026   Servicio de atención         Débito         $7,500
```

### 🎯 Interacción 1: Agregar Nueva Venta

**Paso a paso:**

1. **Click** en botón verde **"Nueva Venta"** (esquina superior derecha)

2. **Completa el formulario:**
   ```
   Fecha:         [Hoy - autocompletada]
   Medio de Pago: Efectivo
   Concepto:      Venta de medicamentos
   Monto:         5000
   ```

3. **Click** en **"Guardar Venta"**

4. **Observa:**
   - ✅ Mensaje de confirmación
   - La nueva venta aparece al inicio de la tabla
   - Los totales se actualizan automáticamente
   - "Hoy" ahora muestra $5,000
   - "Este Mes" ahora muestra $37,500

### 🎯 Interacción 2: Probar Diferentes Medios de Pago

1. Click en **"Nueva Venta"** nuevamente
2. Completa:
   ```
   Concepto:      Consulta de control
   Monto:         3500
   Medio de Pago: Transferencia
   ```
3. Guardar y ver cómo aparece con badge diferente

---

## 📦 Paso 4: Módulo de Stock

### Navegar:
1. Click en **"Stock"** en el menú lateral

### Lo que verás:

```
Producto            Descripción    Cant  Stock Min  Estado
──────────────────────────────────────────────────────────
Alcohol en gel      500ml          45    30         🟢 OK
Barbijos            Caja x 50      18    25         🟡 Bajo
Guantes látex       Caja x 100     15    20         🟡 Bajo
Jeringas 5ml        Descartables   0     15         🔴 Crítico
Gasas estériles     Paquete x 100  65    40         🟢 OK
```

### 🎯 Interacción 1: Buscar Producto

1. **Escribe** en el campo de búsqueda: `guantes`
2. **Observa** cómo se filtra la tabla mostrando solo "Guantes látex"
3. **Borra** el texto para ver todos nuevamente

### 🎯 Interacción 2: Editar Stock (Reponer Jeringas)

Las jeringas están en estado **crítico** (0 unidades). Vamos a reponerlas:

1. **Busca** la fila de "Jeringas 5ml" (🔴 Crítico)

2. **Click** en el ícono de editar ✏️ (última columna)

3. **Se abre el formulario** con los datos actuales

4. **Modifica** solo el campo:
   ```
   Cantidad Actual: 50  (cambiar de 0 a 50)
   ```

5. **Click** en **"Actualizar Producto"**

6. **Observa:**
   - ✅ El estado cambia de 🔴 Crítico a 🟢 OK
   - El Dashboard se actualiza (ahora 0 productos críticos)

### 🎯 Interacción 3: Agregar Nuevo Producto

1. **Click** en **"Agregar Producto"**

2. **Completa el formulario:**
   ```
   Nombre:          Termómetros digitales
   Descripción:     Uso clínico
   Cantidad Actual: 25
   Stock Mínimo:    10
   Precio Unitario: 4500
   ```

3. **Click** en **"Guardar Producto"**

4. **Observa:**
   - Aparece al final de la tabla
   - Estado: 🟢 OK (porque 25 > 10)

### 🎯 Interacción 4: Simular Stock Bajo

1. **Edita** el producto recién creado "Termómetros digitales"
2. **Cambia** Cantidad Actual a: `8`
3. **Guarda**
4. **Observa** cómo el estado cambia a 🟡 Bajo

---

## 💳 Paso 5: Módulo de Gastos

### Navegar:
1. Click en **"Gastos"** en el menú lateral

### Lo que verás:

#### **Total del Mes**
```
┌────────────────────────────┐
│ Total Gastos del Mes       │
│ 📉 $90,500                 │
└────────────────────────────┘
```

#### **Tabla de Gastos**
```
Fecha        Categoría       Concepto                    Monto
─────────────────────────────────────────────────────────────
17/01/2026   Servicios       Pago de luz y agua         $25,000
15/01/2026   Suministros     Material de oficina        $8,500
10/01/2026   Personal        Honorarios Dr. García      $45,000
08/01/2026   Mantenimiento   Reparación equipo médico   $12,000
```

### 🎯 Interacción 1: Registrar Nuevo Gasto

1. **Click** en **"Nuevo Gasto"**

2. **Completa:**
   ```
   Fecha:     [Hoy]
   Categoría: Suministros
   Concepto:  Compra de alcohol en gel x 10 unidades
   Monto:     15000
   ```

3. **Click** en **"Guardar Gasto"**

4. **Observa:**
   - Aparece en la tabla con badge 🟡 amarillo (Suministros)
   - Total del mes se actualiza a $105,500

### 🎯 Interacción 2: Probar Diferentes Categorías

Agrega varios gastos para ver los diferentes colores:

**Gasto 1 - Servicios:**
```
Categoría: Servicios (aparece azul)
Concepto:  Internet mensual
Monto:     5000
```

**Gasto 2 - Personal:**
```
Categoría: Personal (aparece verde)
Concepto:  Honorarios enfermera
Monto:     30000
```

**Gasto 3 - Mantenimiento:**
```
Categoría: Mantenimiento (aparece rojo)
Concepto:  Arreglo de aire acondicionado
Monto:     8000
```

---

## 🔄 Paso 6: Volver al Dashboard

### Navegar:
1. Click en **"Dashboard"** en el menú lateral

### Observa los Cambios:

Las métricas ahora reflejan todas tus interacciones:

```
Ingresos del Mes: Aumentó por las ventas que agregaste
Gastos del Mes:   Aumentó por los gastos registrados
Saldo Neto:       Se recalculó automáticamente
Stock Crítico:    Debería ser 0 (repusiste las jeringas)
```

**Productos con Stock Bajo:**
```
Ahora muestra "Termómetros digitales" (si lo dejaste en 8)
Ya NO aparecen las Jeringas (porque las repusiste a 50)
```

**Últimas Transacciones:**
```
Muestra tus operaciones más recientes mezcladas
```

---

## 🎨 Paso 7: Explorar el Diseño Responsive

### En Desktop:
- **Sidebar** siempre visible a la izquierda
- **Tarjetas** en grid de 4 columnas
- **Tablas** con todas las columnas visibles

### Prueba en Mobile:
1. **Abre** DevTools (F12)
2. **Click** en icono de móvil (Toggle device toolbar)
3. **Selecciona** iPhone o Galaxy S20

**Observa:**
- Sidebar se convierte en menú hamburguesa
- Tarjetas en 1 columna vertical
- Tablas siguen siendo scrolleables
- Formularios en 1 columna

---

## 🧪 Paso 8: Pruebas Avanzadas

### Test 1: Persistencia de Datos
1. **Agrega** una venta o gasto
2. **Recarga** la página (F5)
3. **Observa:** Los datos siguen ahí (localStorage)

### Test 2: Validaciones de Formulario
1. **Intenta** guardar una venta sin monto
2. **Observa:** Error de validación HTML5
3. **Intenta** poner un monto negativo
4. **Observa:** No lo permite (min="0")

### Test 3: Búsqueda en Stock
1. **Busca:** "alcohol"
2. **Busca:** "guantes"
3. **Busca:** "xyz" (no existe)
4. **Observa:** Mensaje "No se encontraron productos"

### Test 4: Estado de Stock Dinámico
1. **Edita** un producto con stock OK
2. **Reduce** cantidad a menos del mínimo
3. **Guarda**
4. **Observa:** Badge cambia de 🟢 OK a 🟡 Bajo
5. **Ve al Dashboard**
6. **Observa:** Ahora aparece en "Stock Bajo"

---

## 📊 Paso 9: Escenario Completo

### Simula un Día Completo de Operaciones:

#### Mañana - Ingreso de Pacientes
```
1. Venta: Consulta Dr. García - $8,000 (Efectivo)
2. Venta: Análisis de laboratorio - $12,000 (Transferencia)
3. Venta: Venta de medicamentos - $5,500 (Efectivo)
```

#### Mediodía - Reposición de Stock
```
1. Editar "Barbijos": Aumentar de 18 a 100
2. Editar "Guantes": Aumentar de 15 a 80
3. Agregar producto: "Alcohol etílico 96%" - 50 unidades
```

#### Tarde - Gastos del Día
```
1. Gasto: Compra de insumos - $35,000 (Suministros)
2. Gasto: Electricidad - $8,000 (Servicios)
```

#### Fin del Día - Revisión en Dashboard
```
1. Ver ingresos del día
2. Ver gastos del día
3. Calcular saldo: ¿Ganancia o pérdida?
4. Revisar si hay productos con stock bajo
```

---

## 🎯 Resumen de Funcionalidades Probadas

### ✅ Dashboard
- [x] Visualizar métricas del mes
- [x] Ver productos con stock crítico/bajo
- [x] Ver últimas transacciones
- [x] Actualización automática de datos

### ✅ Ventas
- [x] Listar ventas existentes
- [x] Agregar nueva venta
- [x] Diferentes medios de pago
- [x] Cálculo automático de totales
- [x] Filtrado por período (día/mes/total)

### ✅ Stock
- [x] Listar productos
- [x] Buscar productos
- [x] Agregar nuevo producto
- [x] Editar producto existente
- [x] Indicadores de estado (OK/Bajo/Crítico)
- [x] Colores dinámicos según stock

### ✅ Gastos
- [x] Listar gastos
- [x] Agregar nuevo gasto
- [x] Categorías con colores diferentes
- [x] Total mensual automático

### ✅ General
- [x] Navegación entre módulos
- [x] Diseño responsive
- [x] Persistencia en localStorage
- [x] Validaciones de formularios
- [x] Feedback visual (badges, colores)

---

## 🔧 Tips y Trucos

### Resetear Datos
Para volver a los datos iniciales:
1. Abre DevTools (F12)
2. Ve a "Application" > "Local Storage"
3. Borra las keys que empiezan con `corepro_demo_`
4. Recarga la página

### Ver Datos en Consola
En DevTools > Console, escribe:
```javascript
localStorage.getItem('corepro_demo_ventas')
localStorage.getItem('corepro_demo_productos')
localStorage.getItem('corepro_demo_gastos')
```

### Simular Muchos Datos
Agrega 10-15 ventas/gastos para ver scroll en tablas

---

## 🎓 Ejercicios Propuestos

### Ejercicio 1: Balance Mensual
1. Suma todos los ingresos del mes
2. Suma todos los gastos del mes
3. Calcula: ¿El balance es positivo o negativo?
4. ¿Cuánto falta para empatar?

### Ejercicio 2: Control de Inventario
1. Identifica productos con stock crítico
2. Calcula cuántas unidades faltan para llegar al mínimo
3. Estima el costo de reposición (cantidad × precio unitario)

### Ejercicio 3: Análisis de Gastos
1. ¿Qué categoría de gasto es la más alta?
2. ¿Cuánto representan los gastos de personal del total?
3. ¿Se pueden reducir algunos gastos?

---

## 🌟 Próximos Pasos

Una vez que explores toda la demo:

1. **Feedback:** ¿Qué te pareció el diseño?
2. **Mejoras:** ¿Qué funcionalidad agregarías?
3. **Firebase:** ¿Listo para configurar la versión real con base de datos?

---

**¡Disfruta explorando CorePro!** 🚀

*Sistema creado con Next.js, React, TypeScript y Tailwind CSS*
