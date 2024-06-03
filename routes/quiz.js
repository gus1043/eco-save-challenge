const express = require('express');
const Quiz = require('../models/quiz');

const router = express.Router();
router.route('/').get(async (req, res, next) => {
    try {
        // 전체 데이터를 가져오기
        const quizes = await Quiz.findAll();

        res.json(quizes);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;
