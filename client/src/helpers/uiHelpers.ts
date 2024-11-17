import {RefObject} from 'react';

export function scrollToTop(elementRef: RefObject<HTMLElement | null>) {
    if (elementRef.current) {
        elementRef.current.scrollIntoView(false);
    }
}
