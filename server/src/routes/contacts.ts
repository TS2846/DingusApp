import {Router} from 'express';
import passport from 'passport';

import {handleErrors} from '../helpers/requestHelpers';
import * as DBErrors from '../errors/dbErrors';
import * as helpers from '../helpers/dbHelpers';

import {ContactAPI} from '../interfaces/apiInterfaces';

const router = Router();

router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    try {
        if (!req.user) {
            throw new DBErrors.UserAuthorizationError('User is not authorized');
        }

        const contacts = helpers.getContacts(req.user.id);
        const data: ContactAPI[] = contacts.map(contact => ({
            id: contact.friend_id,
            room_id: contact.room_id,
            username: helpers.getUser(contact.friend_id)?.username || '',
            about_me: helpers.getUser(contact.friend_id)?.about_me || '',
        }));

        res.json(data);
    } catch (error) {
        handleErrors(error, res);
    }
});

export default router;
