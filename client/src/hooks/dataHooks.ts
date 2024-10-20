import {useMutation, UseMutationOptions} from '@tanstack/react-query';
import axios from 'axios';

import config from '@/config';
import {UserAPI} from '@/interfaces/apiInterfaces';

type LoginPayload = {
    username: string;
    password: string;
};

type SignupPayload = {
    name: string;
    username: string;
    password: string;
};

const postLogin = async (payload: LoginPayload) => {
    const {data} = await axios.post<UserAPI>(
        config.SERVER_URI + '/login',
        payload,
    );

    return data;
};

const postSignup = async (payload: SignupPayload) => {
    const {data} = await axios.post<UserAPI>(
        config.SERVER_URI + '/signup',
        payload,
    );

    return data;
};

export function useLogin({
    ...options
}: UseMutationOptions<UserAPI, Error, LoginPayload, unknown>) {
    return useMutation({
        mutationFn: postLogin,
        ...options,
    });
}

export function useSignup({
    ...options
}: UseMutationOptions<UserAPI, Error, SignupPayload, unknown>) {
    return useMutation({
        mutationFn: postSignup,
        ...options,
    });
}
