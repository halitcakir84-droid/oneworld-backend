const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth');
const votingController = require('../controllers/voting.controller');

// Public routes
router.get('/active', votingController.getActiveVoting);
router.get('/:id/results', votingController.getVotingResults);

// Protected routes (require authentication)
router.post('/:id/vote', authenticate, votingController.castVote);
router.get('/history', authenticate, votingController.getVotingHistory);
router.get('/user/votes', authenticate, votingController.getUserVotes);

// Admin routes
router.post('/', authenticate, isAdmin, votingController.createVoting);
router.put('/:id', authenticate, isAdmin, votingController.updateVoting);
router.delete('/:id', authenticate, isAdmin, votingController.deleteVoting);
router.get('/', authenticate, isAdmin, votingController.getAllVotings);
router.post('/:id/close', authenticate, isAdmin, votingController.closeVoting);

module.exports = router;
