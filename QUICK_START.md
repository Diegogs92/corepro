# ⚡ Quick Start - CorePro Deployment

## Guía Rápida en 15 Minutos

---

## ✅ Checklist Rápido

### Antes de Empezar (Ya tienes):
- [x] Código local funcionando
- [x] Git instalado
- [x] Commit inicial hecho

### Necesitas crear:
- [ ] Cuenta GitHub (1 min)
- [ ] Cuenta Google/Firebase (1 min)
- [ ] Cuenta Vercel (1 min)

**Total tiempo estimado:** 15-20 minutos

---

## 🚀 Paso a Paso Simplificado

### 1️⃣ GITHUB (3 minutos)

```
1. Ir a: github.com/new
2. Nombre: corepro
3. Public/Private: tu elección
4. Create repository
5. Copiar URL mostrada

En tu terminal:
git remote add origin https://github.com/TU-USUARIO/corepro.git
git push -u origin main

✅ Listo
```

---

### 2️⃣ FIREBASE (5 minutos)

```
1. Ir a: console.firebase.google.com
2. Crear proyecto "corepro-ong"
3. Authentication → Email/Password → Habilitar
4. Users → Agregar usuario: admin@corepro.com
5. Firestore → Crear base de datos → Producción
6. Ubicación: southamerica-east1
7. Reglas → Pegar código (ver GUIA_DEPLOYMENT.md)
8. Settings → Tus apps → Web → Copiar credenciales

✅ Guardar credenciales
```

**Credenciales que necesitas copiar:**
```javascript
apiKey: "AIza..."
authDomain: "corepro-ong.firebaseapp.com"
projectId: "corepro-ong"
storageBucket: "..."
messagingSenderId: "..."
appId: "..."
```

---

### 3️⃣ VERCEL (7 minutos)

```
1. Ir a: vercel.com
2. Sign up with GitHub
3. Import Project → Seleccionar "corepro"
4. Environment Variables → Agregar 6 variables:

   NEXT_PUBLIC_FIREBASE_API_KEY
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   NEXT_PUBLIC_FIREBASE_PROJECT_ID
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   NEXT_PUBLIC_FIREBASE_APP_ID

5. Deploy
6. Esperar 2-3 minutos
7. Copiar URL de producción

✅ Listo
```

---

### 4️⃣ CONFIGURACIÓN FINAL (2 minutos)

```
1. Firebase → Authentication → Settings → Authorized domains
2. Agregar: tu-url.vercel.app
3. Probar login en producción

✅ Sistema en vivo!
```

---

## 🎯 URLs que Tendrás

```
Repositorio:  github.com/TU-USUARIO/corepro
Firebase:     console.firebase.google.com/project/corepro-ong
Vercel:       vercel.com/tu-usuario/corepro
Producción:   https://corepro-xyz.vercel.app
```

---

## 📝 Credenciales de Login

```
Email:    admin@corepro.com
Password: [La que creaste en Firebase - Paso 2.4]
```

---

## 🔧 Si algo falla

**Error en Vercel:**
→ Verificar variables de entorno

**Error de login:**
→ Verificar dominio autorizado en Firebase

**Error "Missing permissions":**
→ Verificar reglas de Firestore

**Ver guía completa:** GUIA_DEPLOYMENT.md

---

## 🎉 ¡Eso es todo!

En 15 minutos tu sistema está en producción:
- ✅ Código en GitHub
- ✅ Base de datos en Firebase
- ✅ Desplegado en Vercel
- ✅ HTTPS automático
- ✅ Listo para usar

**Próximo paso:** Comparte la URL con tu equipo!
