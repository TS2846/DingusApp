import {type Response} from 'express';
import * as DBErrors from '../errors/dbErrors';

export function handleErrors(error: unknown, res: Response) {
    if (error instanceof DBErrors.GetDataError) {
        res.status(405).json({
            message: error.message,
        });
    } else if (error instanceof DBErrors.IncorrectPasswordError) {
        res.status(402).json({
            message: error.message,
        });
    } else if (error instanceof DBErrors.InvalidParametersError) {
        res.status(412).json({
            message: error.message,
        });
    } else if (error instanceof DBErrors.UserAlreadyExistsError) {
        res.status(401).json({
            message: error.message,
        });
    } else if (error instanceof DBErrors.UserDoesNotExistError) {
        res.status(405).json({
            message: error.message,
        });
    } else if (error instanceof DBErrors.UserAuthorizationError) {
        res.status(402).json({
            message: error.message,
        });
    } else {
        res.status(501).json({
            message: 'Internal server error.',
        });
    }

    console.error(error);
}
