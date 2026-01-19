# 🔧 Fix: Error de Variables de Entorno en Vercel

## ❌ Error Actual

```
Environment Variable "NEXT_PUBLIC_FIREBASE_API_KEY" references Secret "firebase_api_key", which does not exist.
```

## 🎯 Causa

El archivo `vercel.json` está configurado para usar "Secrets" en lugar de variables de entorno normales.

## ✅ Solución: Eliminar vercel.json

### Paso 1: Eliminar el archivo problemático

En tu computadora:

```bash
cd c:\Users\diego\OneDrive\Documentos\tony
del vercel.json
```

O puedes eliminar manualmente el archivo `vercel.json` desde el explorador de archivos.

### Paso 2: Subir el cambio a GitHub

```bash
git add .
git commit -m "Eliminar vercel.json para usar variables de entorno normales"
git push
```

### Paso 3: Configurar Variables en Vercel (Método Correcto)

1. **Ir a**: https://vercel.com/dgarciasantillan-7059s-projects/corepro

2. **Click en** `Settings` (arriba)

3. **En el menú lateral**, click en `Environment Variables`

4. **Eliminar las variables existentes** (si hay alguna con error)

5. **Agregar nuevamente cada variable**:

#### Variable 1:
```
Key:   NEXT_PUBLIC_FIREBASE_API_KEY
Value: [Pegar tu API Key de Firebase - empieza con AIza...]
```
- Marcar: ✓ Production
- Marcar: ✓ Preview
- Marcar: ✓ Development
- Click en **Save**

#### Variable 2:
```
Key:   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
Value: [Tu authDomain - algo como: corepro-xxxxx.firebaseapp.com]
```
- Marcar las 3 opciones
- Click en **Save**

#### Variable 3:
```
Key:   NEXT_PUBLIC_FIREBASE_PROJECT_ID
Value: [Tu projectId - algo como: corepro-xxxxx]
```
- Marcar las 3 opciones
- Click en **Save**

#### Variable 4:
```
Key:   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
Value: [Tu storageBucket - algo como: corepro-xxxxx.appspot.com]
```
- Marcar las 3 opciones
- Click en **Save**

#### Variable 5:
```
Key:   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
Value: [Tu messagingSenderId - números]
```
- Marcar las 3 opciones
- Click en **Save**

#### Variable 6:
```
Key:   NEXT_PUBLIC_FIREBASE_APP_ID
Value: [Tu appId - empieza con 1:...]
```
- Marcar las 3 opciones
- Click en **Save**

### Paso 4: Redesplegar

1. **Ir a** la pestaña `Deployments`

2. **Click en el deployment más reciente**

3. **Click en los 3 puntos** `⋯` (arriba a la derecha)

4. **Click en** `Redeploy`

5. **Marcar**: Use existing Build Cache

6. **Click en** `Redeploy`

7. **Esperar** 2-3 minutos

---

## 📋 Ejemplo de Cómo Agregar Variables

### ✅ Correcto (lo que debes hacer):

```
Cuando agregas la variable en Vercel directamente en la UI:

┌─────────────────────────────────────────────────┐
│ Add New Variable                                │
├─────────────────────────────────────────────────┤
│ Key                                             │
│ NEXT_PUBLIC_FIREBASE_API_KEY                    │
│                                                  │
│ Value                                            │
│ AIzaSyBnX1234567890abcdefghijklmnop            │
│                                                  │
│ Environments                                     │
│ ☑ Production                                    │
│ ☑ Preview                                       │
│ ☑ Development                                   │
│                                                  │
│             [Cancel]  [Save]                    │
└─────────────────────────────────────────────────┘
```

### ❌ Incorrecto (lo que causó el error):

```
Usar vercel.json con referencias a secrets:

{
  "env": {
    "NEXT_PUBLIC_FIREBASE_API_KEY": "@firebase_api_key"  ← Esto causa error
  }
}
```

---

## 🎯 Verificar que Funcionó

1. **Ir a**: Settings → Environment Variables

2. **Deberías ver las 6 variables** listadas:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY          Production, Preview, Development
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN      Production, Preview, Development
   NEXT_PUBLIC_FIREBASE_PROJECT_ID       Production, Preview, Development
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET   Production, Preview, Development
   NEXT_PUBLIC_FIREBASE_MESSAGING_...    Production, Preview, Development
   NEXT_PUBLIC_FIREBASE_APP_ID           Production, Preview, Development
   ```

3. **Ir a** Deployments → Ver que el último deployment está "Ready" (sin errores)

---

## 🚨 Si Aún Hay Errores

### Error: "Build failed"

**Ver logs del build:**
1. Deployments → Click en el deployment fallido
2. Leer el error en los logs
3. Usualmente es por:
   - Variables mal copiadas (espacios extra, comillas, etc.)
   - Falta alguna variable
   - Valor incorrecto

### Error: "Invalid Firebase configuration"

**Solución:**
1. Verificar que los valores NO tengan comillas
2. Verificar que NO haya espacios al inicio/final
3. Copiar nuevamente de Firebase Console

### Cómo copiar correctamente de Firebase:

```javascript
// En Firebase Console verás algo así:
const firebaseConfig = {
  apiKey: "AIzaSyBnX1234567890abcdefghijklmnop",
  // ↑ Copiar solo esto (sin comillas): AIzaSyBnX1234567890abcdefghijklmnop

  authDomain: "corepro-abc123.firebaseapp.com",
  // ↑ Copiar solo esto: corepro-abc123.firebaseapp.com
};
```

**En Vercel pegar SIN comillas:**
```
Value: AIzaSyBnX1234567890abcdefghijklmnop    ← Correcto
Value: "AIzaSyBnX1234567890abcdefghijklmnop"  ← Incorrecto
```

---

## ✅ Checklist de Solución

- [ ] Eliminar archivo vercel.json
- [ ] Hacer commit y push
- [ ] Ir a Vercel Settings → Environment Variables
- [ ] Eliminar variables con error (si las hay)
- [ ] Agregar las 6 variables nuevamente (sin comillas)
- [ ] Verificar que cada una tenga los 3 environments marcados
- [ ] Redesplegar desde Deployments
- [ ] Esperar a que termine el deploy
- [ ] Verificar que el deploy esté "Ready"

---

## 🎉 Resultado Esperado

Cuando todo funcione, verás:

```
Deployments
├─ Latest deployment
│  └─ Status: Ready ✅
│  └─ No errors
└─ Previous deployments...
```

Y podrás:
1. Visitar tu URL de producción
2. Iniciar sesión con admin@corepro.com
3. Usar el sistema completamente funcional

---

**¿El error persiste?** Comparte el mensaje de error exacto y te ayudo a resolverlo.
