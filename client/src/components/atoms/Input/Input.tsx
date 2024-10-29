import {twMerge} from 'tailwind-merge';
import {InputProps} from 'react-html-props';

export default function Input({className = '', ...restProps}: InputProps) {
    return (
        <input
            className={twMerge(
                'p-2 h-11 rounded-md box-border border border-black ' +
                    'outline-none outline-offset-0 hover:outline ' +
                    'hover:outline-black focus:outline-double focus:border-transparent',
                className,
            )}
            {...restProps}
        />
    );
}
