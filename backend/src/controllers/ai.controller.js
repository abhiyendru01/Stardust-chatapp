const axios = require('axios');

const DO_API_ENDPOINT = process.env.DO_API_ENDPOINT;
const DO_API_KEY = process.env.DO_API_KEY;

exports.chatWithAgent = async (req, res) => {
  const { message } = req.body;

  try {
    const response = await axios.post(
      DO_API_ENDPOINT,
      { input: message },
      {
        headers: {
          Authorization: `Bearer ${DO_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.status(200).json({ reply: response.data.output });
  } catch (error) {
    console.error('Error communicating with AI Agent:', error.message);
    res.status(500).json({ error: 'AI Agent communication failed.' });
  }
};
