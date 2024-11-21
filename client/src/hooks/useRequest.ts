import {useState} from 'react';

import {UserAPI} from '@/interfaces/apiInterfaces.ts';
import api from '@/api';

interface ServerResponse {
    token: string;
    refreshToken: string;
}

interface AuthenticationResponse extends ServerResponse {
    user: UserAPI;
}

export const refresh = () => api.post<ServerResponse>('/refresh-token');

const login = (username: string, password: string) =>
    api.post<AuthenticationResponse>('/login', {username, password});

const signup = (username: string, password: string, about_me: string) =>
    api.post<AuthenticationResponse>('/signup', {
        username,
        password,
        about_me,
    });

export const useLogin = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(false);
    const [data, setData] = useState<ServerResponse | null>(null);

    const queryFn = (username: string, password: string) => {
        setData(null);
        setIsError(false);
        setIsLoading(true);
        login(username, password)
            .then(res => {
                setData(res.data);
                setIsLoading(false);
                setIsError(false);
                return res;
            })
            .catch(() => {
                setIsError(true);
                setData(null);
                setIsLoading(false);
            });
    };

    return {
        isLoading,
        isError,
        data,
        queryFn,
    };
};

export const useSignup = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(false);
    const [data, setData] = useState<ServerResponse | null>(null);

    const queryFn = (username: string, password: string, about_me: string) => {
        setData(null);
        setIsError(false);
        setIsLoading(true);
        signup(username, password, about_me)
            .then(res => {
                setData(res.data);
                setIsLoading(false);
                setIsError(false);
                return res;
            })
            .catch(() => {
                setIsError(true);
                setData(null);
                setIsLoading(false);
            });
    };

    return {
        isLoading,
        isError,
        data,
        queryFn,
    };
};

// TODO: Implement Logout procedure here
// * Delete tokens from localstorage
// * Invalidate all queries
// * Disconnect socket
export const logout = () => api.post('/logout');
