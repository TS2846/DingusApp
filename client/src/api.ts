import axios from 'axios';

import config from '@/config.ts';
import {UserAPI} from '@/interfaces/apiInterfaces.ts';

const api = axios.create({
    baseURL: config.SERVER_URI,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    config => {
        config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
        config.headers.set(
            'x-refresh-token',
            localStorage.getItem('refreshToken'),
        );
        return config;
    },
    error => {
        return Promise.reject(error);
    },
);

interface ServerResponse {
    token: string;
    refreshToken: string;
}

interface AuthenticationResponse extends ServerResponse {
    user: UserAPI;
}

export const refresh = () => api.post<ServerResponse>('/refresh-token');

export const login = (username: string, password: string) =>
    api.post<AuthenticationResponse>('/login', {username, password});

export const signup = (username: string, password: string, about_me: string) =>
    api.post<AuthenticationResponse>('/signup', {
        username,
        password,
        about_me,
    });

export const logout = () => api.post('/logout');

export default api;
