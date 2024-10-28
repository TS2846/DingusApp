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

export class DataInsertError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DataInsertError';
    }
}

export class InvalidParametersError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidParametersError';
    }
}
