// =====================================================
// Supabase Database Types
// Auto-generated types for TypeScript safety
// =====================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      inversores: {
        Row: {
          id: string
          nombre: string
          email: string | null
          telefono: string | null
          monto_invertido_usd: number
          monto_invertido_pesos: number
          porcentaje_participacion: number
          fecha_ingreso: string
          activo: boolean
          notas: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['inversores']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['inversores']['Insert']>
      }
      gastos_inversion: {
        Row: {
          id: string
          inversor_id: string
          fecha: string
          detalle: string
          categoria: 'EQUIPAMIENTO' | 'CONSTRUCCION' | 'INSUMOS_INICIALES' | 'LEGAL' | 'OTROS'
          monto_usd: number
          monto_pesos: number
          precio_dolar: number
          comprobante: string | null
          notas: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['gastos_inversion']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['gastos_inversion']['Insert']>
      }
      socios: {
        Row: {
          id: string
          nombre: string
          apellido: string | null
          email: string | null
          telefono: string | null
          dni: string | null
          fecha_registro: string
          tipo: 'SOCIO_PLENO' | 'SOCIO_ADHERENTE' | 'CLIENTE_FRECUENTE' | 'CLIENTE_OCASIONAL'
          activo: boolean
          saldo: number
          limite_credito: number | null
          notas: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['socios']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['socios']['Insert']>
      }
      movimientos_cuenta_corriente: {
        Row: {
          id: string
          socio_id: string
          fecha: string
          tipo: 'CARGO' | 'PAGO'
          concepto: string
          monto: number
          saldo_anterior: number
          saldo_nuevo: number
          referencia_id: string | null
          referencia_tabla: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['movimientos_cuenta_corriente']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['movimientos_cuenta_corriente']['Insert']>
      }
      pagos: {
        Row: {
          id: string
          fecha: string
          socio_id: string
          venta_id: string | null
          monto: number
          metodo_pago: 'EFECTIVO' | 'TRANSFERENCIA' | 'MERCADOPAGO' | 'CREDITO' | 'DEBITO' | 'CUENTA_CORRIENTE'
          referencia: string | null
          concepto: string
          notas: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['pagos']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['pagos']['Insert']>
      }
      empleados: {
        Row: {
          id: string
          nombre: string
          apellido: string
          puesto: string
          sueldo_mensual: number
          fecha_ingreso: string
          fecha_egreso: string | null
          activo: boolean
          email: string | null
          telefono: string | null
          notas: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['empleados']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['empleados']['Insert']>
      }
      pagos_sueldos: {
        Row: {
          id: string
          empleado_id: string
          fecha: string
          periodo: string
          monto_base: number
          bonos: number
          descuentos: number
          total: number
          metodo_pago: 'EFECTIVO' | 'TRANSFERENCIA' | 'MERCADOPAGO' | 'CREDITO' | 'DEBITO' | 'CUENTA_CORRIENTE'
          pagado: boolean
          notas: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['pagos_sueldos']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['pagos_sueldos']['Insert']>
      }
      categorias_productos: {
        Row: {
          id: string
          nombre: string
          descripcion: string | null
          tipo: 'FLOR' | 'ESQUEJE' | 'KIT' | 'SEMILLA' | 'INSUMO' | 'OTRO'
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['categorias_productos']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['categorias_productos']['Insert']>
      }
      productos: {
        Row: {
          id: string
          categoria_id: string
          nombre: string
          variedad: string | null
          descripcion: string | null
          unidad_medida: 'GRAMOS' | 'UNIDADES' | 'KITS'
          precio_base: number
          precio_base_currency: 'ARS' | 'USD' | null
          stock_minimo: number
          stock_actual: number
          activo: boolean
          imagen_url: string | null
          thc: number | null
          cbd: number | null
          notas: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['productos']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['productos']['Insert']>
      }
      movimientos_stock: {
        Row: {
          id: string
          producto_id: string
          fecha: string
          tipo: 'INGRESO' | 'EGRESO' | 'AJUSTE' | 'COSECHA'
          cantidad: number
          stock_anterior: number
          stock_nuevo: number
          motivo: string
          referencia_id: string | null
          referencia_tabla: string | null
          lote: string | null
          peso_humedo: number | null
          peso_seco: number | null
          usuario_id: string | null
          notas: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['movimientos_stock']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['movimientos_stock']['Insert']>
      }
      ventas: {
        Row: {
          id: string
          numero: number
          fecha: string
          socio_id: string
          vendedor_id: string | null
          subtotal: number
          descuento: number
          total: number
          estado_pago: 'PENDIENTE' | 'PARCIAL' | 'PAGADO'
          monto_pagado: number
          saldo_pendiente: number
          metodo_pago: 'EFECTIVO' | 'TRANSFERENCIA' | 'MERCADOPAGO' | 'CREDITO' | 'DEBITO' | 'CUENTA_CORRIENTE' | null
          entregado: boolean
          fecha_entrega: string | null
          notas: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['ventas']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['ventas']['Insert']>
      }
      items_venta: {
        Row: {
          id: string
          venta_id: string
          producto_id: string
          descripcion: string
          cantidad: number
          precio_unitario: number
          subtotal: number
          descuento: number
          total: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['items_venta']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['items_venta']['Insert']>
      }
      categorias_gastos: {
        Row: {
          id: string
          nombre: string
          tipo: 'FIJO' | 'VARIABLE'
          descripcion: string | null
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['categorias_gastos']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['categorias_gastos']['Insert']>
      }
      gastos: {
        Row: {
          id: string
          numero: number
          fecha: string
          categoria_id: string
          detalle: string
          proveedor: string | null
          monto: number
          monto_currency: 'ARS' | 'USD' | null
          metodo_pago: 'EFECTIVO' | 'TRANSFERENCIA' | 'MERCADOPAGO' | 'CREDITO' | 'DEBITO' | 'CUENTA_CORRIENTE'
          pagado: boolean
          fecha_pago: string | null
          comprobante: string | null
          es_recurrente: boolean
          frecuencia: 'MENSUAL' | 'BIMESTRAL' | 'TRIMESTRAL' | 'ANUAL' | null
          vencimiento: string | null
          notas: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['gastos']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['gastos']['Insert']>
      }
      movimientos_caja: {
        Row: {
          id: string
          fecha: string
          tipo: 'INGRESO' | 'EGRESO'
          categoria: 'VENTA' | 'GASTO' | 'SUELDO' | 'RETIRO' | 'APORTE' | 'OTRO'
          monto: number
          metodo_pago: 'EFECTIVO' | 'TRANSFERENCIA' | 'MERCADOPAGO' | 'CREDITO' | 'DEBITO' | 'CUENTA_CORRIENTE'
          concepto: string
          referencia_id: string | null
          referencia_tabla: string | null
          saldo_anterior: number
          saldo_nuevo: number
          responsable: string | null
          notas: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['movimientos_caja']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['movimientos_caja']['Insert']>
      }
      cosechas: {
        Row: {
          id: string
          numero: number
          fecha: string
          sala: 'SALA_1' | 'SALA_2'
          variedad: string
          cantidad_plantas: number
          peso_humedo: number
          peso_seco: number
          rendimiento: number
          fecha_secado: string | null
          fecha_curado: string | null
          calidad: 'A' | 'B' | 'C'
          lote: string
          notas: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['cosechas']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['cosechas']['Insert']>
      }
      geneticas: {
        Row: {
          id: string
          nombre: string
          origen: string | null
          tipo: 'FEMINIZADA' | 'AUTO' | 'REGULAR' | 'CLON' | null
          notas: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['geneticas']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['geneticas']['Insert']>
      }
      camas: {
        Row: {
          id: string
          nombre: string
          ubicacion: string | null
          capacidad: number | null
          ancho_cm: number | null
          largo_cm: number | null
          alto_cm: number | null
          notas: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['camas']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['camas']['Insert']>
      }
      macetas: {
        Row: {
          id: string
          nombre: string
          cama_id: string | null
          volumen_litros: number | null
          ubicacion: string | null
          notas: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['macetas']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['macetas']['Insert']>
      }
      cultivos: {
        Row: {
          id: string
          nombre: string
          codigo_interno: string | null
          tipo_ubicacion: 'CAMA' | 'MACETA'
          cama_id: string | null
          maceta_id: string | null
          genetica_id: string | null
          etapa_actual: 'GERMINACION' | 'PLANTULA' | 'VEGETATIVO' | 'FLORACION' | 'COSECHA' | 'SECADO_CURADO'
          estado: 'ACTIVO' | 'PAUSADO' | 'FINALIZADO'
          fecha_inicio: string
          fecha_fin: string | null
          notas: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
          created_by: string | null
          updated_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['cultivos']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['cultivos']['Insert']>
      }
      registros_cultivo: {
        Row: {
          id: string
          cultivo_id: string
          tipo: 'ETAPA' | 'LUZ_AMBIENTE' | 'RIEGO_NUTRICION' | 'SANIDAD' | 'GENERAL'
          fecha: string
          payload: Json
          notas: string | null
          created_at: string
          created_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['registros_cultivo']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['registros_cultivo']['Insert']>
      }
      usuarios: {
        Row: {
          id: string
          username: string
          nombre: string
          apellido: string | null
          email: string | null
          rol: 'ADMIN' | 'GERENTE' | 'VENDEDOR' | 'OPERADOR'
          activo: boolean
          fecha_creacion: string
          ultimo_acceso: string | null
          telefono: string | null
          avatar: string | null
          notas: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['usuarios']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['usuarios']['Insert']>
      }
      secuencias: {
        Row: {
          nombre: string
          numero: number
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['secuencias']['Row'], 'updated_at'>
        Update: Partial<Database['public']['Tables']['secuencias']['Insert']>
      }
    }
    Views: {
      socios_con_deuda: {
        Row: {
          id: string
          nombre: string
          apellido: string | null
          email: string | null
          telefono: string | null
          dni: string | null
          fecha_registro: string
          tipo: 'SOCIO_PLENO' | 'SOCIO_ADHERENTE' | 'CLIENTE_FRECUENTE' | 'CLIENTE_OCASIONAL'
          activo: boolean
          saldo: number
          limite_credito: number | null
          notas: string | null
          created_at: string
          updated_at: string
          monto_deuda: number
        }
      }
      productos_stock_bajo: {
        Row: {
          id: string
          categoria_id: string
          nombre: string
          variedad: string | null
          descripcion: string | null
          unidad_medida: 'GRAMOS' | 'UNIDADES' | 'KITS'
          precio_base: number
          precio_base_currency: 'ARS' | 'USD' | null
          stock_minimo: number
          stock_actual: number
          activo: boolean
          imagen_url: string | null
          thc: number | null
          cbd: number | null
          notas: string | null
          created_at: string
          updated_at: string
          categoria_nombre: string
        }
      }
      cultivos_activos: {
        Row: {
          id: string
          nombre: string
          codigo_interno: string | null
          tipo_ubicacion: 'CAMA' | 'MACETA'
          cama_id: string | null
          maceta_id: string | null
          genetica_id: string | null
          etapa_actual: 'GERMINACION' | 'PLANTULA' | 'VEGETATIVO' | 'FLORACION' | 'COSECHA' | 'SECADO_CURADO'
          estado: 'ACTIVO' | 'PAUSADO' | 'FINALIZADO'
          fecha_inicio: string
          fecha_fin: string | null
          notas: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
          created_by: string | null
          updated_by: string | null
          genetica_nombre: string | null
          cama_nombre: string | null
          maceta_nombre: string | null
        }
      }
    }
    Functions: {
      get_next_sequence: {
        Args: { sequence_name: string }
        Returns: number
      }
    }
  }
}
