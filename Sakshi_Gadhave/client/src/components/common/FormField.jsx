export default function FormField({ label, name, error, required = false, full = false, hint, children }) {
  return (
    <div className={full ? 'field field--full' : 'field'}>
      <label htmlFor={name} className="field__label">
        {label}
        {required && <span className="field__required"> *</span>}
      </label>
      {children}
      {hint && !error && <p className="field__hint">{hint}</p>}
      {error && <p className="field__error">{error}</p>}
    </div>
  );
}