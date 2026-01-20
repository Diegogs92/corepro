/**
 * Script para resetear la contraseña del usuario admin
 * Ejecutar: npx tsx scripts/reset-admin-password.ts
 */

import { config } from "dotenv";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, updatePassword } from "firebase/auth";

// Cargar variables de entorno
config({ path: ".env.local" });

// Inicializar Firebase
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

async function resetAdminPassword() {
  console.log("🔐 Reseteando contraseña del usuario admin...\n");

  try {
    const adminEmail = "admin@thegardenboys.local";
    const oldPassword = "admin123"; // Contraseña anterior
    const newPassword = "GardenBoys2024!"; // Nueva contraseña

    console.log("📝 Paso 1: Iniciando sesión con contraseña anterior...");

    // Iniciar sesión con la contraseña anterior
    const userCredential = await signInWithEmailAndPassword(
      auth,
      adminEmail,
      oldPassword
    );

    console.log("✅ Sesión iniciada correctamente");
    console.log(`   UID: ${userCredential.user.uid}\n`);

    console.log("📝 Paso 2: Actualizando contraseña...");

    // Actualizar la contraseña
    await updatePassword(userCredential.user, newPassword);

    console.log("✅ Contraseña actualizada exitosamente\n");

    console.log("=".repeat(60));
    console.log("🎉 ¡Contraseña reseteada correctamente!");
    console.log("=".repeat(60));
    console.log("\n🔐 Nuevas credenciales:");
    console.log(`   Usuario:     admin`);
    console.log(`   Contraseña:  ${newPassword}`);
    console.log(`   Email:       ${adminEmail}`);

    console.log("\n🌐 Próximos pasos:");
    console.log("   1. Ve a http://localhost:3000/login");
    console.log("   2. Inicia sesión con la nueva contraseña");
    console.log("\n");

  } catch (error: any) {
    console.error("\n❌ Error:", error.message);

    if (error.code === "auth/wrong-password") {
      console.log("\n💡 Sugerencia: La contraseña anterior puede ser incorrecta.");
      console.log("   Si ya cambiaste la contraseña antes, actualiza 'oldPassword' en el script.");
    } else if (error.code === "auth/user-not-found") {
      console.log("\n💡 Sugerencia: El usuario admin no existe.");
      console.log("   Ejecuta: npx tsx scripts/init-firebase.ts");
    }

    process.exit(1);
  }
}

// Ejecutar el script
resetAdminPassword()
  .then(() => {
    console.log("✅ Script finalizado correctamente");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error fatal:", error);
    process.exit(1);
  });
