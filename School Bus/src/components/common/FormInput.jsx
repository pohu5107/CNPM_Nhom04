const FormInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  readOnly = false,
  options = [],
  rows = 3,
  className = '',
  ...props
}) => {
  const baseInputClasses = 'w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 transition-colors';
  const errorClasses = error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-slate-500';
  const readOnlyClasses = readOnly ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : 'bg-white';
  
  const inputClasses = `${baseInputClasses} ${errorClasses} ${readOnlyClasses} ${className}`;

  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <select
            name={name}
            value={value}
            onChange={onChange}
            className={inputClasses}
            required={required}
            disabled={readOnly}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'textarea':
        return (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={inputClasses}
            rows={rows}
            required={required}
            readOnly={readOnly}
            {...props}
          />
        );
      
      default:
        return (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={inputClasses}
            required={required}
            readOnly={readOnly}
            {...props}
          />
        );
    }
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {renderInput()}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default FormInput;