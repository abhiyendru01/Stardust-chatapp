// backend/routes/notification.route.js

import express from 'express';
import { subscribeToNotifications } from '../controllers/notification.controller';

const router = express.Router();

// Define the route for subscribing to push notifications
router.post('/subscribe', subscribeToNotifications);

export default router;
