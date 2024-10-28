export interface SignupPayload {
    user_uuid: string;
    username: string;
    password: string;
    first_name: string;
    last_name: string;
    about_me: string;
}

export interface LoginPayload {
    username: string;
    password: string;
}
