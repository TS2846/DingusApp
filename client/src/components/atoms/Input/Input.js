import {forwardRef} from 'react';
import {twMerge} from 'tailwind-merge';

export default forwardRef(function Input(props, ref) {
    const {className = '', ...restProps} = props;

    return (
        <input
            className={twMerge(
                'p-2 h-11 rounded-md box-border border border-black hover:border-2 focus:border-2',
                className,
            )}
            {...restProps}
            ref={ref}
        />
    );
});
