/**
 * Script para crear el usuario admin inicial en Firebase
 * Este archivo debe ejecutarse una sola vez después de configurar Firebase
 */

import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export async function createAdminUser() {
  try {
    const adminUsername = "admin";
    const adminPassword = "admin123"; // CAMBIAR ESTO en producción
    const virtualEmail = `${adminUsername}@thegreenboys.local`;

    console.log("Creando usuario admin...");

    // 1. Crear usuario en Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      virtualEmail,
      adminPassword
    );

    console.log("Usuario creado en Firebase Auth:", userCredential.user.uid);

    // 2. Crear documento en Firestore
    await setDoc(doc(db, "usuarios", userCredential.user.uid), {
      username: adminUsername,
      nombre: "Admin",
      apellido: "Sistema",
      email: "admin@thegreenboys.com",
      rol: "ADMIN",
      activo: true,
      fechaCreacion: Timestamp.now(),
      telefono: null,
      avatar: null,
      notas: "Usuario administrador del sistema",
    });

    console.log("✓ Usuario admin creado exitosamente");
    console.log("Username:", adminUsername);
    console.log("Password:", adminPassword);
    console.log("UID:", userCredential.user.uid);

    return userCredential.user;
  } catch (error: any) {
    if (error.code === "auth/email-already-in-use") {
      console.log("El usuario admin ya existe");
    } else {
      console.error("Error creando usuario admin:", error);
      throw error;
    }
  }
}
