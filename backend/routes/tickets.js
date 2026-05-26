const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

router.post('/', ticketController.createTicket);
router.get('/', ticketController.getTickets);
router.get('/stats', ticketController.getTicketStats);
router.patch('/:id', ticketController.updateTicketStatus);
router.delete('/:id', ticketController.deleteTicket);

module.exports = router;
