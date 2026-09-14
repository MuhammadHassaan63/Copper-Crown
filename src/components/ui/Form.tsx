import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';

export function Input({
  label,
  error,
  ...props
}: { label?: string; error?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      {label && <label className="label-field">{label}</label>}
      <input className="input-field" {...props} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function Textarea({
  label,
  error,
  ...props
}: { label?: string; error?: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      {label && <label className="label-field">{label}</label>}
      <textarea className="input-field min-h-[100px] resize-y" {...props} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function Select({
  label,
  error,
  children,
  ...props
}: { label?: string; error?: string; children: React.ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      {label && <label className="label-field">{label}</label>}
      <select className="input-field appearance-none cursor-pointer" {...props}>
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
