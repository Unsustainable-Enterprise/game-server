import express from 'express';
import { sessionController } from '../controllers/index';

const router = express.Router();

router.get('/initiate-session', sessionController.initiateSession);

export default router;
