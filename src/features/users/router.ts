import express from 'express';

const router = express.Router();

router.get('/', function (req, res) {
  res.send('users');
});

export default router;
