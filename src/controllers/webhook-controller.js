const webhookService = require('../services/webhook-service');

const webhookController = {
  handleMonnifyWebhook: asyncHandler(async (req, res) => {
    const payload = req.body;
    const signature = req.headers['monnify-signature'] || req.headers['x-monnify-signature'];
    
    const result = await webhookService.processMonnifyWebhook(payload, signature);
    
    res.status(200).json({ success: true });
  })
};

module.exports = webhookController;