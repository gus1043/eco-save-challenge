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

                // user.id를 사용하여 residence_info를 조회
                const residenceInfo = await Residence_info.findOne({ where: { user: user.email } });
                console.log('residence_info:', residenceInfo);

                res.status(200).json({
                    message: 'Login successful',
                    residence_info: residenceInfo,
                });
            });
        })(req, res, next);
    });

// logout
router.get('/logout', isLoggedIn, (req, res) => {
    req.logout(() => {
        req.session.destroy();
        res.redirect('/');
    });
});

// 회원탈퇴
router.delete('/delete', isLoggedIn, async (req, res, next) => {
    try {
        await User.destroy({
            where: {
                email: req.user.email,
            },
        });
        return res.send("<script>alert('회원탈퇴가 완료되었습니다.');location.href='/';</script>");
    } catch (error) {
        console.error(error);
        return next(error);
    }
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

//마이페이지 렌더
router.get('/mypage', isLoggedIn, async (req, res, next) => {
    try {
        res.render('mypage', { title: '마이페이지', user: req.user });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

//마이페이지 - 프로필 불러오기
router
    .route('/mypage/profile')
    .get(async (req, res, next) => {
        try {
            const residenceInfo = await Residence_info.findOne({ where: { user: req.user.email } });
            res.json(residenceInfo);
        } catch (err) {
            console.error(err);
            next(err);
        }
    })
    .put(async (req, res, next) => {
        try {
            const { address, houseStructure, numMember, electApplication, age } = req.body;

            console.log('수정데이터:', req.body);

            // 수정할 사람 찾기
            const residenceInfo = await Residence_info.findOne({ where: { user: req.user.email } });
            console.log('찾는사람:', residenceInfo);

            // 주소 정보 업데이트
            if (residenceInfo) {
                // 데이터 형식을 숫자로 변환
                const numMemberInt = parseInt(numMember);
                const electApplicationInt = parseInt(electApplication);

                // 업데이트할 필드명을 모델과 일치시킴
                const updatedResidenceInfo = await residenceInfo.update({
                    address,
                    house_structure: houseStructure, // 필드명을 모델과 일치시킴
                    num_member: numMemberInt, // 숫자형으로 변환하여 할당
                    electrical_appliance: electApplicationInt, // 숫자형으로 변환하여 할당
                    age,
                });

                console.log('결과', updatedResidenceInfo);

                // 수정된 주소 정보를 클라이언트에 반환
                res.status(200).json({
                    message: '사용자의 주소 정보가 성공적으로 업데이트되었습니다.',
                    residenceInfo: updatedResidenceInfo,
                });
            } else {
                // 찾은 주소 정보가 없을 경우
                return res.status(404).json({ message: '해당 사용자의 주소 정보를 찾을 수 없습니다.' });
            }
        } catch (err) {
            console.error(err);
            next(err);
        }
    });

// 마이페이지 - ai 리포트
router.get('/mypage/aireport', isLoggedIn, async (req, res, next) => {
    try {
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;
