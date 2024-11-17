export interface SignupPayload {
    user_uuid: string;
    username: string;
    password: string;
    about_me: string;
}

export interface LoginPayload {
    username: string;
    password: string;
}
