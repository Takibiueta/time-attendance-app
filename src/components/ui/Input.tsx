import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, fullWidth = true, className = '', onKeyDown, ...props }, ref) => {
    const inputClasses = `
      form-input
      ${error ? 'border-error-500 focus:border-error-500 focus:ring-error-200' : ''}
      ${className}
    `;

    const containerClasses = `
      ${fullWidth ? 'w-full' : ''}
      mb-4
    `;

    // Enterキーでフォーム送信を防ぐ
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && props.type === 'number') {
        e.preventDefault(); // フォーム送信を防ぐ
        (e.target as HTMLInputElement).blur(); // フォーカスを外して値を確定
      }
      
      // 元のonKeyDownハンドラーがあれば実行
      if (onKeyDown) {
        onKeyDown(e);
      }
    };

    return (
      <div className={containerClasses}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input 
          ref={ref} 
          className={inputClasses} 
          onKeyDown={handleKeyDown}
          {...props} 
        />
        {error && <p className="mt-1 text-sm text-error-600">{error}</p>}
        {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;