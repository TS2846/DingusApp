import {twMerge} from 'tailwind-merge';

type ButtonProps = {
    label: string;
    className: string;
    [x: string]: any;
};

export default function Button({
    label,
    className = '',
    ...restProps
}: ButtonProps) {
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
