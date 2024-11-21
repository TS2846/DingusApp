import {createContext, useContext} from 'react';
export type pageStatusType = 'friends' | 'chatbot' | 'room';

const PageStatusContext = createContext<
    | null
    | [pageStatusType, React.Dispatch<React.SetStateAction<pageStatusType>>]
>(null);

export const usePageStatus = (): [
    pageStatusType,
    React.Dispatch<React.SetStateAction<pageStatusType>>,
] => {
    const value = useContext(PageStatusContext);

    if (value === null) {
        throw new Error('useRoom must be used inside a RoomContext');
    }

    return value;
};

export default PageStatusContext;
