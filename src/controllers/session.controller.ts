import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

class SessionController {
    public initiateSession = (req: Request, res: Response) => {
        const uniqueSessionId = uuidv4();
        console.log(uniqueSessionId);
        res.send(`Session initiated for session ID: ${uniqueSessionId}`);
    };
}

export default new SessionController();
