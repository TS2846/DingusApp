export class UserAlreadyExistsError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'UserAlreadyExistsError';
    }
}

export class IncorrectPasswordError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidPasswordError';
    }
}

export class UserDoesNotExistError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'UserDoesNotExist';
    }
}

export class GetDataError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'GetDataError';
    }
}

export class InvalidParametersError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidParametersError';
    }
}

export class UserAuthorizationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'UserAuthorizationError';
    }
}
