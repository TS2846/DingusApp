import {createContext, useContext} from 'react';

const AuthenticationContext = createContext<
    null | [boolean, React.Dispatch<React.SetStateAction<boolean>>]
>(null);

export const useAuthentication = (): [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>,
] => {
    const value = useContext(AuthenticationContext);

    if (value === null) {
        throw Error(
            'useAuthentication must be used inside a AuthenticationContext',
        );
    }

    return value;
};

export default AuthenticationContext;
