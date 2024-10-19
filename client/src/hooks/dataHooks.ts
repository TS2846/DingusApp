import {useMutation, UseMutationOptions} from '@tanstack/react-query';
import axios from 'axios';
import config from '@/config';

type LoginPayload = {
    username: string;
    password: string;
};

type UserPayload = {id: string; username: string; name: string};

const postLogin = (payload: LoginPayload) => {
    return axios.post<LoginPayload, UserPayload>(
        config.SERVER_URI + '/login',
        payload,
    );
};

export function useLogin({
    ...options
}: UseMutationOptions<UserPayload, Error, LoginPayload, unknown>) {
    return useMutation({
        mutationFn: postLogin,
        ...options,
    });
}
