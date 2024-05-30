const express = require('express');
const User = require('../models/user');

const router = express.Router();

//메인페이지
router.get('/', async (req, res, next) => {
    try {
        const users = await User.findAll();
        res.render('sequelize', { users });
    } catch (err) {
        console.error(err);
        next(err);
    }
    res.render('home', { title: '홈' });
});
module.exports = router;
