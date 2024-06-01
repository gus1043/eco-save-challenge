const express = require('express');
const User = require('../models/user');

const router = express.Router();

//메인페이지
router.get('/', async (req, res, next) => {
    try {
        const user = req.user ? req.user : null; // 회원 정보
        res.render('home', { title: '홈', user: req.user });
    } catch (err) {
        console.error(err);
        next(err);
    }
});
module.exports = router;
