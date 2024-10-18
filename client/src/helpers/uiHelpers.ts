import {RefObject} from 'react';

export function scrollToTop(elementRef: RefObject<HTMLElement | null>) {
    if (elementRef.current) {
        elementRef.current.scrollTop = elementRef.current.scrollHeight;
    }
}
