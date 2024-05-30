const express = require('express');
const User = require('../models/user');

const router = express.Router();

//메인페이지
router.get('/', async (req, res, next) => {
    try {
        const users = await User.findAll();
        res.render('home', { title: '홈' });
    } catch (err) {
        console.error(err);
        next(err);
    }
});
module.exports = router;
