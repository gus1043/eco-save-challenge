const express = require('express');
const Wiki = require('../models/wiki');

const router = express.Router();
router.route('/').get(async (req, res, next) => {
    res.render('community', { title: '커뮤니티' });
});
router
    .route('/wikis')
    .get(async (req, res, next) => {
        try {
            const wikis = await Wiki.findAll({
                attributes: ['created_at', 'content'],
                order: [['created_at', 'DESC']],
                limit: 1,
            });
            res.json(wikis);
        } catch (err) {
            console.error(err);
            next(err);
        }
    })
    .post(async (req, res, next) => {
        try {
            const { created_at, content } = req.body; //입력 내용

            if (!content) {
                return res.status(400).json({ error: 'Content cannot be null' });
            }

            const wiki = await Wiki.create({ created_at, content });
            console.log(wiki);
            res.status(201).json(wiki);
        } catch (err) {
            console.error(err);
            next(err);
        }
    });
module.exports = router;
