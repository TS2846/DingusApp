import {twMerge} from 'tailwind-merge';
import {ButtonProps} from 'react-html-props';

interface ButtonWithLabelProps extends ButtonProps {
    label: string;
}

export default function Button({
    label,
    className = '',
    ...restProps
}: ButtonWithLabelProps) {
    return (
        <button
            className={twMerge(
                'p-2 h-11 rounded-md border border-black font-bold hover:bg-emerald-700 hover:text-white transition-colors ease-in',
                className,
            )}
            {...restProps}
        >
            {label}
        </button>
    );
}
