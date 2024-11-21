import axios, {AxiosInstance} from 'axios';

import config from '@/config.ts';

let api: AxiosInstance | null = null;

const getAPI = (): AxiosInstance => {
    if (!api) {
        api = axios.create({
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
    }

    return api;
};

export default getAPI();
