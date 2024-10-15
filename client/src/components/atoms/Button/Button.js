import {twMerge} from 'tailwind-merge';

export default function Button({label, className = '', ...restProps}) {
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
