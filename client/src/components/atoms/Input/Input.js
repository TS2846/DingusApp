import {twMerge} from 'tailwind-merge';

export default function Input({className = '', ...restProps}) {
    return (
        <input
            className={twMerge(
                'p-2 h-11 rounded-md box-border border border-black hover:border-2 focus:border-2',
                className,
            )}
            {...restProps}
        />
    );
}
