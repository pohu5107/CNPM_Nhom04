const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  type = 'button',
  disabled = false,
  loading = false,
  icon,
  ...props 
}) => {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = size === 'sm' ? 'btn-sm' : '';
  
  const className = [baseClass, variantClass, sizeClass].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span>Đang xử lý...</span>
      ) : (
        <>
          {icon && <span style={{ marginRight: '8px' }}>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;