import {CgSpinner} from 'react-icons/cg';

export default function AuthenticationLoading() {
    return (
        <span className="p-2 bg-primary-foreground rounded-md inline-flex flex-row text-xl items-center justify-center">
            <CgSpinner className="animate-spin h-5 w-5 mr-3" />
            Please Wait...
        </span>
    );
}
