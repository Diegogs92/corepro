import { useState, useEffect } from "react";
import { DollarSign } from "lucide-react";

interface PriceInputProps {
  label: string;
  value: number;
  onChange: (value: number, currency: "ARS" | "USD") => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  exchangeRate?: number;
}

export default function PriceInput({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  className = "",
  exchangeRate = 1495, // Tipo de cambio por defecto (Dólar Blue - actualizado 20/01/2026)
}: PriceInputProps) {
  const [currency, setCurrency] = useState<"ARS" | "USD">("ARS");
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleValueChange = (newValue: string) => {
    setInputValue(newValue);
    const numValue = parseFloat(newValue) || 0;
    onChange(numValue, currency);
  };

  const handleCurrencyChange = (newCurrency: "ARS" | "USD") => {
    setCurrency(newCurrency);
    const numValue = parseFloat(inputValue) || 0;
    onChange(numValue, newCurrency);
  };

  const getConvertedValue = () => {
    const numValue = parseFloat(inputValue) || 0;
    if (currency === "ARS") {
      return (numValue / exchangeRate).toFixed(2);
    } else {
      return (numValue * exchangeRate).toFixed(2);
    }
  };

  const getConvertedCurrency = () => {
    return currency === "ARS" ? "USD" : "ARS";
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        {label}
        {required && <span className="text-danger-500 ml-1">*</span>}
      </label>

      <div className="space-y-2">
        {/* Input principal con selector de moneda */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="number"
              step="0.01"
              min="0"
              value={inputValue}
              onChange={(e) => handleValueChange(e.target.value)}
              disabled={disabled}
              required={required}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                       bg-white dark:bg-slate-700
                       text-slate-900 dark:text-slate-100
                       placeholder-slate-400 dark:placeholder-slate-500
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                       disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="0.00"
            />
          </div>

          {/* Selector de moneda */}
          <select
            value={currency}
            onChange={(e) => handleCurrencyChange(e.target.value as "ARS" | "USD")}
            disabled={disabled}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                     bg-white dark:bg-slate-700
                     text-slate-900 dark:text-slate-100
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     disabled:opacity-50 disabled:cursor-not-allowed
                     min-w-[100px]"
          >
            <option value="ARS">ARS $</option>
            <option value="USD">USD $</option>
          </select>
        </div>

        {/* Conversión automática */}
        {parseFloat(inputValue) > 0 && (
          <div className="text-sm text-slate-500 dark:text-slate-400 pl-10">
            ≈ {getConvertedCurrency()} ${" "}
            {parseFloat(getConvertedValue()).toLocaleString("es-AR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            <span className="ml-2 text-xs">
              (TC: ${exchangeRate.toLocaleString("es-AR")})
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
