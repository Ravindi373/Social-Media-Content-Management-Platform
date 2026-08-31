const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { listUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');

// All user management routes are Administrator-only
router.use(verifyToken, requireRole('Administrator'));

router.get('/', listUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
