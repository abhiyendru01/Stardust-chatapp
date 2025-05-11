const express = require('express');
const router = express.Router();
const { chatWithAgent } = require('../controllers/ai.controller');

router.post('/chat', chatWithAgent);

module.exports = router;
