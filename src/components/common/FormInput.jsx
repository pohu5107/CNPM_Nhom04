const FormInput = ({ 
  label, 
  name, 
  type = "text", 
  value, 
  onChange, 
  error, 
  placeholder,
  required = false,
  readOnly = false,
  rows,
  options = [], // for select
  ...props 
}) => {
  const inputProps = {
    name,
    value: value || '',
    onChange,
    placeholder,
    readOnly,
    ...props
  };

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...inputProps}
            className="form-input"
            rows={rows || 3}
          />
        );
      
      case 'select':
        return (
          <select
            {...inputProps}
            className="form-select"
            disabled={readOnly}
          >
            <option value="">{placeholder || `Chọn ${label.toLowerCase()}`}</option>
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      default:
        return (
          <input
            {...inputProps}
            type={type}
            className="form-input"
          />
        );
    }
  };

  return (
    <div className="form-group">
      <label className="form-label">
        {label} {required && '*'}
      </label>
      {renderInput()}
      {error && (
        <span style={{ color: '#ef4444', fontSize: '12px' }}>
          {error}
        </span>
      )}
    </div>
  );
};

export default FormInput;