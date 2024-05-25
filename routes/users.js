const express = require('express');
const User = require('../models/user');
const User_info = require('../models/user_info');
const Residence_info = require('../models/residence_info');

const router = express.Router();

router
    .route('/signup')
    // .get(async (req, res, next) => {
    //     try {
    //         const users = await User.findAll();
    //         res.json(users);
    //     } catch (err) {
    //         console.error(err);
    //         next(err);
    //     }
    // })
    .post(async (req, res, next) => {
        try {
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({ error: 'Content cannot be null' });
            }

            // 이메일 중복 검사
            const existingUser = await User.findOne({ where: { email: email } });
            if (existingUser) {
                // 같은 이메일을 가진 사용자가 이미 존재하는 경우
                return res.status(409).json({ error: 'Email already exists' });
            }

            const user = await User.create({
                email,
                name,
                password,
            });
            console.log(user);
            res.status(201).json(user);
        } catch (err) {
            console.error(err);
            next(err);
        }
    });

router.get('/:id/comments', async (req, res, next) => {
    try {
        const comments = await Comment.findAll({
            include: {
                model: User,
                where: { id: req.params.id },
            },
        });
        console.log(comments);
        res.json(comments);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;
