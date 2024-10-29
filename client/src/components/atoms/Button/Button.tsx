import {twMerge} from 'tailwind-merge';
import {ButtonProps} from 'react-html-props';
import {IconType} from 'react-icons';

interface ButtonWithLabelProps extends ButtonProps {
    ButtonLabel: string | IconType;
}

export default function Button({
    ButtonLabel,
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
            {typeof ButtonLabel === 'string' ? ButtonLabel : <ButtonLabel />}
        </button>
    );
}
