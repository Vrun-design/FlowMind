import React from 'react';
import { Loader2 } from 'lucide-react';
import { IS_BEVELED } from '@/lib/brand';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon';
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon';
    shape?: 'default' | 'pill' | 'square';
    isLoading?: boolean;
    icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
    className = '',
    variant = 'primary',
    size = 'md',
    shape = 'default',
    isLoading,
    icon,
    children,
    disabled,
    ...props
}, ref) => {
    const isBeveled = IS_BEVELED;

    const baseStyles = "inline-flex items-center justify-center font-medium transition-all focus:outline-none disabled:pointer-events-none disabled:shadow-none active:scale-[0.98] disabled:active:scale-100";

    const variants = {
        primary: `
            bg-[var(--brand-primary)] text-white 
            ${isBeveled ? 'btn-beveled-primary' : 'shadow-sm hover:shadow-md'}
            hover:brightness-110 disabled:border-[color-mix(in_srgb,var(--brand-primary),white_50%)] disabled:bg-[color-mix(in_srgb,var(--brand-primary),white_72%)] disabled:text-white
        `.replace(/\s+/g, ' ').trim(),

        secondary: `
            bg-white text-slate-700 border border-slate-200 
            ${isBeveled ? 'btn-beveled-secondary' : 'shadow-sm hover:shadow-md'}
            hover:bg-[var(--brand-primary-50)] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary-200)] disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400
        `.replace(/\s+/g, ' ').trim(),

        ghost: "text-slate-500 hover:bg-[var(--brand-primary-50)] hover:text-[var(--brand-primary)] transition-colors",
        danger: "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 active:scale-95",
        icon: "text-slate-500 hover:text-slate-900 hover:bg-slate-100 active:scale-95",
    };

    const sizes = {
        sm: "h-9 px-3 text-xs gap-1.5",
        md: "h-10 px-4 text-sm gap-2",
        lg: "h-12 px-6 text-base gap-2.5",
        xl: "h-14 px-8 text-lg font-semibold gap-2.5",
        icon: "h-9 w-9 p-0",
    };

    const shapes = {
        default: "rounded-[var(--radius-md)]",
        pill: "rounded-full",
        square: "rounded-none",
    };

    return (
        <button
            ref={ref}
            className={`
                ${baseStyles}
                ${variants[variant]}
                ${sizes[size]}
                ${shapes[shape]}
                ${className}
            `}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {!isLoading && icon && <span className={`${children ? '' : ''}`}>{icon}</span>}
            {children}
        </button>
    );
});

Button.displayName = "Button";
