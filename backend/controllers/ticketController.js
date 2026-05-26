const Ticket = require('../models/Ticket');

const SLA_TARGETS = {
  urgent: 60,
  high: 240,
  medium: 1440,
  low: 4320
};

const STATUS_ORDER = ['open', 'in_progress', 'resolved', 'closed'];

const calculateSla = (ticket) => {
  const targetMinutes = SLA_TARGETS[ticket.priority] || 4320;
  
  let endTime = new Date();
  // If the ticket is resolved or closed, we stop the timer at resolvedAt
  if ((ticket.status === 'resolved' || ticket.status === 'closed') && ticket.resolvedAt) {
    endTime = ticket.resolvedAt;
  }
  
  const ageMinutes = Math.floor(Math.max(0, endTime - ticket.createdAt) / 60000);
  const slaBreached = ageMinutes > targetMinutes;
  
  return {
    ...ticket.toObject(),
    ageMinutes,
    slaBreached,
    targetMinutes
  };
};

exports.createTicket = async (req, res) => {
  try {
    const { subject, description, customerEmail, priority } = req.body;
    const ticket = new Ticket({
      subject,
      description,
      customerEmail,
      priority
    });
    await ticket.save();
    res.status(201).json(calculateSla(ticket));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getTickets = async (req, res) => {
  try {
    const { status, priority, breached } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const tickets = await Ticket.find(filter).sort({ createdAt: -1 });
    
    let processedTickets = tickets.map(calculateSla);
    
    if (breached === 'true') {
      processedTickets = processedTickets.filter(t => t.slaBreached);
    } else if (breached === 'false') {
      processedTickets = processedTickets.filter(t => !t.slaBreached);
    }
    
    res.status(200).json(processedTickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status: newStatus } = req.body;

    if (!newStatus || !STATUS_ORDER.includes(newStatus)) {
      return res.status(400).json({ error: 'Invalid status provided.' });
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }

    const currentIndex = STATUS_ORDER.indexOf(ticket.status);
    const newIndex = STATUS_ORDER.indexOf(newStatus);

    if (currentIndex === newIndex) {
      return res.status(200).json(calculateSla(ticket));
    }

    if (Math.abs(newIndex - currentIndex) !== 1) {
      return res.status(400).json({ 
        error: `Invalid status transition from ${ticket.status} to ${newStatus}. You can only move one step forward or backward.` 
      });
    }

    ticket.status = newStatus;

    if (newStatus === 'resolved') {
      ticket.resolvedAt = new Date();
    } else if (ticket.status !== 'closed' && ticket.status !== 'resolved') {
       // If moving back from resolved (or closed) to in_progress or open
       ticket.resolvedAt = null;
    }

    await ticket.save();
    res.status(200).json(calculateSla(ticket));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findByIdAndDelete(id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }
    res.status(200).json({ message: 'Ticket deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTicketStats = async (req, res) => {
  try {
    const tickets = await Ticket.find();
    
    const stats = {
      status: {
        open: 0,
        in_progress: 0,
        resolved: 0,
        closed: 0
      },
      priority: {
        low: 0,
        medium: 0,
        high: 0,
        urgent: 0
      },
      breached: 0
    };

    tickets.forEach(t => {
      if (stats.status[t.status] !== undefined) {
        stats.status[t.status]++;
      }
      if (stats.priority[t.priority] !== undefined) {
        stats.priority[t.priority]++;
      }
      
      const processed = calculateSla(t);
      if (processed.slaBreached) {
        stats.breached++;
      }
    });

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
