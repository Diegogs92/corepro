#!/bin/bash

# Script para actualizar imports de Firebase a Supabase

echo "🔄 Actualizando imports de Firebase a Supabase..."

# Actualizar AuthContext a AuthContextSupabase
echo "1️⃣ Actualizando AuthContext imports..."
find app -name "*.tsx" -o -name "*.ts" | while read file; do
    if grep -q "@/contexts/AuthContext" "$file"; then
        sed -i 's|@/contexts/AuthContext|@/contexts/AuthContextSupabase|g' "$file"
        echo "   ✅ $file"
    fi
done

# Actualizar firebaseService a supabaseService
echo ""
echo "2️⃣ Actualizando firebaseService imports..."
find app -name "*.tsx" -o -name "*.ts" | while read file; do
    if grep -q "@/lib/firebaseService" "$file"; then
        sed -i 's|@/lib/firebaseService|@/lib/supabaseService|g' "$file"
        echo "   ✅ $file"
    fi
done

echo ""
echo "✅ Todos los imports actualizados!"
echo ""
echo "Archivos modificados:"
git diff --name-only
