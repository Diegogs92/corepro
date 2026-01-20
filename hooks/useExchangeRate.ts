import { useState, useEffect } from 'react';

interface ExchangeRateResponse {
  success: boolean;
  timestamp: number;
  base: string;
  date: string;
  rates: {
    ARS: number;
  };
}

export function useExchangeRate() {
  const [exchangeRate, setExchangeRate] = useState<number>(1495); // Valor por defecto
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiKey = '69a49f2fe496e3c302bd0d46ed688368';
        const response = await fetch(
          `https://api.exchangeratesapi.io/v1/latest?access_key=${apiKey}&base=EUR&symbols=USD,ARS`
        );

        if (!response.ok) {
          throw new Error('Error al obtener el tipo de cambio');
        }

        const data: ExchangeRateResponse = await response.json();

        if (data.success && data.rates.ARS) {
          // La API devuelve tasas basadas en EUR, necesitamos calcular ARS/USD
          // EUR -> ARS y EUR -> USD, entonces ARS/USD = (EUR/ARS) / (EUR/USD)
          const arsRate = data.rates.ARS;
          const usdRate = (data.rates as any).USD || 1;
          const arsPerUsd = arsRate / usdRate;

          setExchangeRate(Math.round(arsPerUsd * 100) / 100); // Redondear a 2 decimales
        } else {
          throw new Error('Formato de respuesta inválido');
        }
      } catch (err) {
        console.error('Error fetching exchange rate:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        // Mantener el valor por defecto en caso de error
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRate();

    // Actualizar cada hora
    const interval = setInterval(fetchExchangeRate, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return { exchangeRate, loading, error };
}
