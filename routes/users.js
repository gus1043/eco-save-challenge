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
        res.render('signup', { title: '회원가입', user: null });
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
        } catch (err) {
            console.error(err);
            return next(err);
        }
    });

// local login
router
    .route('/login')
    .get(isNotLoggedIn, (req, res) => {
        res.render('login', { title: '로그인', user: null });
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
            return req.login(user, async (loginError) => {
                if (loginError) {
                    console.error(loginError);
                    return next(loginError);
                }

                // 여기서 ResidenceInfoModel는 residence_info 테이블을 나타내는 모델입니다.
                // user.id를 사용하여 residence_info를 조회합니다.
                const residenceInfo = await Residence_info.findOne({ where: { user: user.email } });

                // residence_info가 존재하고 address 컬럼이 있는지 확인합니다.
                const address = residenceInfo ? residenceInfo.address : null;
                console.log('residence_info:', residenceInfo);
                // residence_info가 존재하면 해당 정보를 포함하여 응답을 반환합니다.
                // 존재하지 않으면 null 또는 적절한 메시지를 반환합니다.
                res.status(200).json({
                    message: 'Login successful',
                    residence_info: address ? address : 'No residence information found',
                });
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

// 유저 정보 세팅
router
    .route('/residenceInfo')
    .get(isLoggedIn, async (req, res, next) => {
        try {
            console.log(req.user);

            // 사용자 정보를 렌더링
            res.render('residenceInfo', { title: '유저 세팅', user: req.user });
        } catch (err) {
            console.error(err);
            next(err);
        }
    })
    .post(isLoggedIn, async (req, res, next) => {
        try {
            const residence_info = await Residence_info.create({
                user: req.user.email,
                address: req.body.addressInput,
                house_structure: req.body.homestructure,
                num_member: req.body.num_member,
                electrical_appliance: req.body.elect_application,
                age: req.body.age,
                agree: req.body.agree,
            });
            res.status(201).json(residence_info);
        } catch (err) {
            console.error(err);
            next(err);
        }
    });

// 마이페이지
router.get('/mypage', isLoggedIn, async (req, res, next) => {
    try {
        console.log(req.user);

        // 사용자 정보를 렌더링
        res.render('mypage', { title: '마이페이지', user: req.user });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;
