'use client';

import type { CSSProperties } from 'react';

type FormFieldProps = {
  label: string;
  name: string;
  type?: 'text' | 'number' | 'url' | 'password' | 'textarea' | 'select';
  defaultValue?: string | number | null;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  rows?: number;
  options?: { value: string | number; label: string }[];
  onChange?: (value: string) => void;
  value?: string;
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #cbd9cb',
  borderRadius: 8,
  fontSize: 13,
  outline: 'none',
  background: '#f4f7f4',
  color: '#2a392a',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

export default function FormField({
  label,
  name,
  type = 'text',
  defaultValue,
  placeholder,
  required,
  hint,
  rows = 4,
  options = [],
  onChange,
  value,
}: FormFieldProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        htmlFor={name}
        style={{
          display: 'block',
          fontSize: 13,
          fontWeight: 600,
          color: '#334433',
          marginBottom: 6,
        }}
      >
        {label}
        {required && <span style={{ color: '#dc2626', marginLeft: 4 }}>*</span>}
      </label>

      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          defaultValue={defaultValue ?? ''}
          placeholder={placeholder}
          required={required}
          rows={rows}
          style={{ ...inputStyle, resize: 'vertical', minHeight: 96 }}
        />
      ) : type === 'select' ? (
        <select
          id={name}
          name={name}
          defaultValue={defaultValue ?? ''}
          required={required}
          style={inputStyle}
        >
          <option value="">Pilih...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          defaultValue={value === undefined ? (defaultValue ?? '') : undefined}
          value={value}
          placeholder={placeholder}
          required={required}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          style={inputStyle}
        />
      )}

      {hint && (
        <p style={{ margin: '6px 0 0', fontSize: 11, color: '#7fa07f' }}>{hint}</p>
      )}
    </div>
  );
}
