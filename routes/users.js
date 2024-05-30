const express = require('express');
const User = require('../models/user');
const User_info = require('../models/user_info');
const Residence_info = require('../models/residence_info');

const bcrypt = require('bcrypt');
const passport = require('../passport/index.js');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

const router = express.Router();

// req.user의 사용자 데이터를 ejs에서 이용가능하도록 res.locals에 저장
router.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

//local 회원가입
router
    .route('/signup')
    .get(isNotLoggedIn, (req, res) => {
        res.render('signup', { title: '회원가입' });
    })

    .post(isNotLoggedIn, async (req, res, next) => {
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
            console.info('___User.create(): ' + name);
            const hash = await bcrypt.hash(password, 12);
            const user = await User.create({
                email,
                name,
                password: hash,
            });
            console.log(user);
            res.status(201).json(user);
            return res.redirect('/users/login');
        } catch (err) {
            console.error(err);
            return next(err);
        }
    });

// local login
router
    .route('/login')
    .get(isNotLoggedIn, (req, res) => {
        res.render('login', { title: '회원가입' });
    })
    .post(isNotLoggedIn, (req, res, next) => {
        passport.authenticate('local', (authError, user, info) => {
            console.info('___passport.authenticate()');
            if (authError) {
                console.error(authError);
                return next(authError);
            }
            if (!user) {
                // 유저가 없는 경우
                return res.status(409).json({ error: 'User is not exists' });
            }

            console.info('___req.login()');
            return req.login(user, (loginError) => {
                if (loginError) {
                    console.error(loginError);
                    return next(loginError);
                }
                // 로그인 성공 후 상태 코드 200과 함께 성공 메시지 반환
                return res.status(200).json({ message: 'Login successful' });
            });
        })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
    });

// logout
router.get('/logout', isLoggedIn, (req, res) => {
    req.logout(() => {
        req.session.destroy();
        res.redirect('/');
    });
});

// kakao site login
router.get('/kakao', passport.authenticate('kakao'));

// kakao site login후 자동 redirect
// kakao 계정 정보를 이용하여 login or 회원가입/login
router.get(
    '/kakao/callback',
    passport.authenticate('kakao', {
        failureRedirect: '/',
    }),
    (req, res) => {
        res.redirect('/');
    }
);
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
