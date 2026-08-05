import React, { useState, useEffect } from 'react';
import { Phone, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';

export interface CountryCode {
  code: string;
  country: string;
  iso: string;
  flag: string;
  placeholder: string;
  digitsCount: number | number[]; // exact length or array of acceptable lengths
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: '+91', country: 'India', iso: 'IN', flag: '🇮🇳', placeholder: '98765 43210', digitsCount: 10 },
  { code: '+1', country: 'United States / Canada', iso: 'US', flag: '🇺🇸', placeholder: '(555) 000-0000', digitsCount: 10 },
  { code: '+44', country: 'United Kingdom', iso: 'GB', flag: '🇬🇧', placeholder: '7123 456789', digitsCount: [10, 11] },
  { code: '+61', country: 'Australia', iso: 'AU', flag: '🇦🇺', placeholder: '412 345 678', digitsCount: 9 },
  { code: '+49', country: 'Germany', iso: 'DE', flag: '🇩🇪', placeholder: '151 12345678', digitsCount: [10, 11] },
  { code: '+33', country: 'France', iso: 'FR', flag: '🇫🇷', placeholder: '6 12 34 56 78', digitsCount: 9 },
  { code: '+81', country: 'Japan', iso: 'JP', flag: '🇯🇵', placeholder: '90 1234 5678', digitsCount: 10 },
  { code: '+86', country: 'China', iso: 'CN', flag: '🇨🇳', placeholder: '138 1234 5678', digitsCount: 11 },
  { code: '+971', country: 'UAE', iso: 'AE', flag: '🇦🇪', placeholder: '50 123 4567', digitsCount: 9 },
  { code: '+65', country: 'Singapore', iso: 'SG', flag: '🇸🇬', placeholder: '8123 4567', digitsCount: 8 },
  { code: '+55', country: 'Brazil', iso: 'BR', flag: '🇧🇷', placeholder: '11 91234-5678', digitsCount: [10, 11] },
];

interface PhoneInputProps {
  value: string;
  onChange: (fullNumber: string, isValid: boolean) => void;
  required?: boolean;
  label?: string;
  id?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  required = false,
  label = 'Phone Number',
  id = 'phone-input',
}) => {
  // Parse initial value to extract country code or default to India (+91)
  const initialCountry = COUNTRY_CODES.find((c) => value.startsWith(c.code)) || COUNTRY_CODES[0];
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(initialCountry);
  const [localNumber, setLocalNumber] = useState<string>(() => {
    if (value.startsWith(initialCountry.code)) {
      return value.slice(initialCountry.code.length).trim();
    }
    return value;
  });

  // Extract raw digits from input string
  const digitsOnly = localNumber.replace(/\D/g, '');

  // Validate digits count against selected country rules
  const isValidLength = Array.isArray(selectedCountry.digitsCount)
    ? selectedCountry.digitsCount.includes(digitsOnly.length)
    : digitsOnly.length === selectedCountry.digitsCount;

  const isTouched = digitsOnly.length > 0;
  const isValid = !required && digitsOnly.length === 0 ? true : isValidLength;

  // Format display text
  const fullNumber = digitsOnly ? `${selectedCountry.code} ${digitsOnly}` : '';

  useEffect(() => {
    onChange(fullNumber, isValid);
  }, [selectedCountry, digitsOnly, isValid]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const found = COUNTRY_CODES.find((c) => c.code === e.target.value);
    if (found) {
      setSelectedCountry(found);
    }
  };

  const getExpectedLengthLabel = () => {
    if (Array.isArray(selectedCountry.digitsCount)) {
      return `${selectedCountry.digitsCount.join(' or ')} digits`;
    }
    return `${selectedCountry.digitsCount} digits`;
  };

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {/* Country Code Selector */}
        <div className="relative shrink-0">
          <select
            value={selectedCountry.code}
            onChange={handleCountryChange}
            className="appearance-none bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold py-2.5 pl-8 pr-7 rounded-l-xl border border-r-0 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#9b51e0]/20 cursor-pointer"
          >
            {COUNTRY_CODES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.code} ({c.iso})
              </option>
            ))}
          </select>
          <span className="absolute left-2.5 top-2.5 pointer-events-none text-sm">{selectedCountry.flag}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-3 pointer-events-none" />
        </div>

        {/* Local Number Field */}
        <div className="relative flex-1">
          <input
            id={id}
            type="tel"
            value={localNumber}
            onChange={(e) => setLocalNumber(e.target.value)}
            placeholder={selectedCountry.placeholder}
            required={required}
            className={`w-full pl-3 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-r-xl text-xs text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 outline-none transition-all ${
              isTouched && !isValidLength
                ? 'border-rose-400 dark:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                : isTouched && isValidLength
                ? 'border-emerald-400 dark:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                : 'border-slate-200 dark:border-slate-700 focus:border-[#9b51e0] dark:focus:border-purple-400'
            }`}
          />

          {/* Validation Indicator Icon */}
          <div className="absolute right-2.5 top-2.5">
            {isTouched && isValidLength && (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 animate-fadeIn" />
            )}
            {isTouched && !isValidLength && (
              <AlertCircle className="w-4 h-4 text-rose-500 animate-fadeIn" />
            )}
          </div>
        </div>
      </div>

      {/* Validation Message / Hint */}
      <div className="flex items-center justify-between text-[10px] px-1 pt-0.5">
        <span className="text-slate-400 dark:text-slate-500">
          Format: {selectedCountry.code} ({getExpectedLengthLabel()})
        </span>
        {isTouched && !isValidLength && (
          <span className="text-rose-500 dark:text-rose-400 font-medium">
            Requires {getExpectedLengthLabel()} (currently {digitsOnly.length})
          </span>
        )}
        {isTouched && isValidLength && (
          <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
            Valid phone number format
          </span>
        )}
      </div>
    </div>
  );
};
