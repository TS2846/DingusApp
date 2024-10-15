export function scrollToTop(elementRef) {
    if (elementRef.current) {
        elementRef.current.scrollTop = elementRef.current.scrollHeight;
    }
}
