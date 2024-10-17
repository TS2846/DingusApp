export interface SignupPayload {
    id: string;
    username: string;
    password: string;
    name: string;
}

export interface LoginPayload {
    username: string;
    password: string;
}
