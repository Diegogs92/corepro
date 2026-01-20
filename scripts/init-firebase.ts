/**
 * Script de inicialización completa de Firebase
 * Crea el usuario admin y las colecciones iniciales en Firestore
 *
 * Ejecutar: npx tsx scripts/init-firebase.ts
 */

import { config } from "dotenv";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, writeBatch, Timestamp } from "firebase/firestore";

// Cargar variables de entorno
config({ path: ".env.local" });

// Inicializar Firebase con las variables de entorno
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function initializeFirebase() {
  console.log("🔥 Iniciando configuración de Firebase...\n");

  try {
    // =========================================================================
    // 1. CREAR USUARIO ADMIN
    // =========================================================================
    console.log("📝 Paso 1: Creando usuario administrador...");

    const adminUsername = "admin";
    const adminPassword = "admin123";
    const virtualEmail = `${adminUsername}@thegardenboys.local`;

    let adminUid: string;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        virtualEmail,
        adminPassword
      );
      adminUid = userCredential.user.uid;
      console.log("✅ Usuario admin creado en Firebase Auth");
      console.log(`   UID: ${adminUid}`);
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        console.log("⚠️  Usuario admin ya existe en Authentication");
        // Si ya existe, intentar obtener el usuario actual
        const currentUser = auth.currentUser;
        if (currentUser) {
          adminUid = currentUser.uid;
        } else {
          console.log("❌ No se pudo obtener el UID del usuario existente");
          console.log("   Por favor, inicia sesión primero o elimina el usuario existente");
          return;
        }
      } else {
        throw error;
      }
    }

    // =========================================================================
    // 2. CREAR DOCUMENTO DE USUARIO ADMIN EN FIRESTORE
    // =========================================================================
    console.log("\n📝 Paso 2: Creando documento de usuario en Firestore...");

    await setDoc(doc(db, "usuarios", adminUid), {
      username: adminUsername,
      nombre: "Admin",
      apellido: "Sistema",
      email: "admin@thegardenboys.com",
      rol: "ADMIN",
      activo: true,
      fechaCreacion: Timestamp.now(),
      telefono: null,
      avatar: null,
      notas: "Usuario administrador del sistema",
    });
    console.log("✅ Documento de usuario admin creado");

    // =========================================================================
    // 3. CREAR CATEGORÍAS DE PRODUCTOS
    // =========================================================================
    console.log("\n📝 Paso 3: Creando categorías de productos...");

    const categoriasProductos = [
      {
        id: "cat-001",
        nombre: "Flores",
        descripcion: "Flores de cannabis de diferentes variedades",
        color: "#10b981",
        activo: true,
      },
      {
        id: "cat-002",
        nombre: "Resinas",
        descripcion: "Hachís y resinas de cannabis",
        color: "#f59e0b",
        activo: true,
      },
      {
        id: "cat-003",
        nombre: "Extractos",
        descripcion: "Aceites y extractos concentrados",
        color: "#8b5cf6",
        activo: true,
      },
    ];

    const batch1 = writeBatch(db);
    categoriasProductos.forEach((cat) => {
      const docRef = doc(db, "categoriasProductos", cat.id);
      batch1.set(docRef, cat);
    });
    await batch1.commit();
    console.log(`✅ ${categoriasProductos.length} categorías de productos creadas`);

    // =========================================================================
    // 4. CREAR TIPOS DE SOCIO
    // =========================================================================
    console.log("\n📝 Paso 4: Creando tipos de socio...");

    const tiposSocio = [
      {
        id: "tipo-001",
        nombre: "Regular",
        descripcion: "Membresía regular del club",
        cuotaMensual: 5000,
        limiteCompra: 20,
        activo: true,
      },
      {
        id: "tipo-002",
        nombre: "Premium",
        descripcion: "Membresía premium con beneficios adicionales",
        cuotaMensual: 8000,
        limiteCompra: 40,
        activo: true,
      },
      {
        id: "tipo-003",
        nombre: "VIP",
        descripcion: "Membresía VIP con acceso completo",
        cuotaMensual: 12000,
        limiteCompra: 60,
        activo: true,
      },
    ];

    const batch2 = writeBatch(db);
    tiposSocio.forEach((tipo) => {
      const docRef = doc(db, "tiposSocio", tipo.id);
      batch2.set(docRef, tipo);
    });
    await batch2.commit();
    console.log(`✅ ${tiposSocio.length} tipos de socio creados`);

    // =========================================================================
    // 5. CREAR CATEGORÍAS DE GASTOS
    // =========================================================================
    console.log("\n📝 Paso 5: Creando categorías de gastos...");

    const categoriasGastos = [
      {
        id: "gasto-cat-001",
        nombre: "Suministros",
        descripcion: "Compra de productos y suministros",
        color: "#3b82f6",
        activo: true,
      },
      {
        id: "gasto-cat-002",
        nombre: "Servicios",
        descripcion: "Servicios básicos (luz, agua, internet, etc.)",
        color: "#10b981",
        activo: true,
      },
      {
        id: "gasto-cat-003",
        nombre: "Mantenimiento",
        descripcion: "Mantenimiento de instalaciones y equipos",
        color: "#f59e0b",
        activo: true,
      },
      {
        id: "gasto-cat-004",
        nombre: "Personal",
        descripcion: "Salarios y beneficios del personal",
        color: "#8b5cf6",
        activo: true,
      },
      {
        id: "gasto-cat-005",
        nombre: "Otros",
        descripcion: "Gastos varios no categorizados",
        color: "#6b7280",
        activo: true,
      },
    ];

    const batch3 = writeBatch(db);
    categoriasGastos.forEach((cat) => {
      const docRef = doc(db, "categoriasGastos", cat.id);
      batch3.set(docRef, cat);
    });
    await batch3.commit();
    console.log(`✅ ${categoriasGastos.length} categorías de gastos creadas`);

    // =========================================================================
    // 6. CREAR COLECCIONES VACÍAS (para estructura)
    // =========================================================================
    console.log("\n📝 Paso 6: Inicializando colecciones adicionales...");

    const colecciones = ["productos", "socios", "ventas", "gastos", "movimientosStock"];

    for (const coleccion of colecciones) {
      const placeholderRef = doc(db, coleccion, "_placeholder");
      await setDoc(placeholderRef, { _placeholder: true, _info: "Este documento se puede eliminar" });
      console.log(`✅ Colección '${coleccion}' inicializada`);
    }

    // =========================================================================
    // RESUMEN
    // =========================================================================
    console.log("\n" + "=".repeat(60));
    console.log("🎉 ¡Inicialización de Firebase completada exitosamente!");
    console.log("=".repeat(60));
    console.log("\n📊 Resumen:");
    console.log(`   ✅ Usuario admin creado`);
    console.log(`   ✅ ${categoriasProductos.length} categorías de productos`);
    console.log(`   ✅ ${tiposSocio.length} tipos de socio`);
    console.log(`   ✅ ${categoriasGastos.length} categorías de gastos`);
    console.log(`   ✅ ${colecciones.length} colecciones inicializadas`);

    console.log("\n🔐 Credenciales de acceso:");
    console.log(`   Usuario:     ${adminUsername}`);
    console.log(`   Contraseña:  ${adminPassword}`);
    console.log(`   Email:       ${virtualEmail}`);

    console.log("\n🌐 Próximos pasos:");
    console.log("   1. Ve a http://localhost:3000/login");
    console.log("   2. Inicia sesión con las credenciales de arriba");
    console.log("   3. ¡Comienza a usar el sistema!");
    console.log("\n");

  } catch (error) {
    console.error("\n❌ Error durante la inicialización:", error);
    process.exit(1);
  }
}

// Ejecutar el script
initializeFirebase()
  .then(() => {
    console.log("✅ Script finalizado correctamente");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error fatal:", error);
    process.exit(1);
  });
