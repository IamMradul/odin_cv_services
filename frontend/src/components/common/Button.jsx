import React from 'react';
import './common.css';

export const Button = ({
  variant = 'primary',
  size = '',
  children,
  icon: Icon,
  iconRight: IconRight,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${sizeClass} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 13 : 16} />}
      {children}
      {IconRight && <IconRight size={size === 'sm' ? 13 : 16} />}
    </button>
  );
};
