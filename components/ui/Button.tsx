import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
    icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
    className = '',
    variant = 'primary',
    size = 'md',
    isLoading,
    icon,
    children,
    disabled,
    ...props
}, ref) => {

    const baseStyles = "inline-flex items-center justify-center font-medium transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        primary: "bg-[var(--brand-primary)] text-white hover:brightness-110 rounded-[var(--radius-md)] active:scale-95",
        secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-[var(--brand-primary-50)] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary-200)] rounded-[var(--radius-md)] active:scale-95",
        ghost: "text-slate-600 hover:bg-[var(--brand-primary-50)] hover:text-[var(--brand-primary)] rounded-[var(--radius-md)]",
        danger: "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-[var(--radius-md)] active:scale-95",
        icon: "text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-[var(--radius-md)] active:scale-95",
    };

    const sizes = {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-9 w-9 p-0",
    };

    return (
        <button
            ref={ref}
            className={`
                ${baseStyles}
                ${variants[variant]}
                ${sizes[size]}
                ${className}
            `}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {!isLoading && icon && <span className={`${children ? 'mr-2' : ''}`}>{icon}</span>}
            {children}
        </button>
    );
});

Button.displayName = "Button";
