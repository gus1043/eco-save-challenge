const express = require('express');
const User = require('../models/user');
const User_info = require('../models/user_info');
const Residence_info = require('../models/residence_info');

const bcrypt = require('bcrypt');
const passport = require('../passport/index.js');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Op } = require('sequelize');

// 공공 api를 받아오기위한 모듈 추가
const axios = require('axios');
const { parseStringPromise } = require('xml2js');

const router = express.Router();

const OPEN_API_KEY = process.env.OPEN_API_KEY;
const endpoint = 'https://bigdata.kepco.co.kr/openapi/v1/powerUsage/houseAve.do';

const OPEN_API_KEY_SIGUNGU = process.env.OPEN_API_KEY_SIGUNGU;
const endpoint_sigungu = 'http://apis.data.go.kr/1741000/StanReginCd/getStanReginCdList';

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
                if (existingUser.provider == 'kakao') {
                    return res.status(409).json({ error: '카카오 계정으로 가입된 계정이 있습니다.' });
                } else {
                    // 같은 이메일을 가진 사용자가 이미 존재하는 경우
                    return res.status(409).json({ error: '이미 있는 계정입니다.' });
                }
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
    async (req, res) => {
        // user.id를 사용하여 residence_info를 조회 후 리다이렉트 조절
        const residenceInfo = await Residence_info.findOne({ where: { user: req.user.email } });
        console.log('residence_info:', residenceInfo);

        if (residenceInfo == null) {
            res.redirect('/users/residenceInfo');
        } else {
            res.redirect('/');
        }
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
                nickname: req.body.nickname,
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

// 유저 요금 post
router.route('/billpost').post(isLoggedIn, async (req, res, next) => {
    try {
        const user_info = await User_info.create({
            user: req.user.email,
            bill: req.body.bill,
            date: req.body.date,
        });
        res.status(201).json(user_info);
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
    .route('/profile')
    .get(async (req, res, next) => {
        try {
            const userInfo = await Residence_info.findAll({
                where: { user: req.user.email },
                include: [
                    {
                        model: User_info,
                        model: User_info,
                        order: [['date', 'DESC']],
                        limit: 2,
                        required: false, // LEFT JOIN
                        separate: false, // Ensure separate is not used
                    },
                ],
            });

            console.log('유저인포:', userInfo);

            let date = null;
            let bill = null;
            if (userInfo[0].User_info) {
                date = userInfo[0].User_info.date;
                bill = userInfo[0].User_info.bill;
            }
            const age = userInfo[0].age;
            const address = userInfo[0].address;
            const electrical_appliance = userInfo[0].electrical_appliance;
            const num_member = userInfo[0].num_member;
            const house_structure = userInfo[0].house_structure;

            //지난달보다 아낀 수
            if (userInfo.length === 2) {
                const latestBill = userInfo[0].bill;
                const previousBill = userInfo[1].bill;
                saveBill = latestBill - previousBill;
                console.log('지난 달보다 아낀 정도:', saveBill);
            } else {
                saveBill = null;
            }

            // 이미지를 매핑하는 객체
            const imageMap = {
                savedALot: [
                    'face-savoring-food_1f60b.png',
                    'partying-face_1f973.png',
                    'hugging-face_1f917.png',
                    'smiling-face-with-hearts_1f970.png',
                    'unicorn_1f984.png',
                ],
                overspent: [
                    'face-with-steam-from-nose_1f624.png',
                    'loudly-crying-face_1f62d.png',
                    'melting-face_1fae0.png',
                    'face-with-spiral-eyes_1f635-200d-1f4ab.png',
                    'dizzy-face_1f635.png',
                ],
                average: ['nerd-face_1f913.png', 'cat-face_1f431.png', 'cowboy-hat-face_1f920.png', 'frog_1f438.png'],
            };

            // 이미지를 랜덤으로 선택하는 함수
            function getRandomImage(category) {
                const images = imageMap[category];
                const randomIndex = Math.floor(Math.random() * images.length);
                return images[randomIndex];
            }

            // 돈을 얼마나 아꼈는지에 따라 이미지를 선택(기준은  +-5000원, 이전 기록이 없을 시 평균 이미지)
            let selectedImage = '';
            if (saveBill <= -5000) {
                selectedImage = getRandomImage('savedALot');
            } else if (saveBill >= 5000) {
                selectedImage = getRandomImage('overspent');
            } else {
                selectedImage = getRandomImage('average');
            }

            res.json({
                date: date,
                bill: bill,
                saveBill: saveBill,
                age: age,
                address: address,
                electrical_appliance: electrical_appliance,
                num_member: num_member,
                house_structure: house_structure,
                image: selectedImage,
            });
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

//3개월 전 리포트
router.get('/3month', async (req, res, next) => {
    try {
        const userInfo = await User_info.findAll({
            where: { user: req.user.email },
            order: [['date', 'DESC']],
            limit: 4,
            include: [
                {
                    model: Residence_info,
                },
            ],
        });

        console.log('유저인포: ', userInfo);

        //비교를 위한 현재 연월
        const now = new Date();
        const currentYear = now.getFullYear();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        // 3개월 전 날짜 yyyy-mm으로 가져오기
        const threeagoyear = threeMonthsAgo.getFullYear();
        let threeagomonth = threeMonthsAgo.getMonth() + 1;
        threeagomonth = threeagomonth < 10 ? '0' + threeagomonth : threeagomonth;
        const formattedDate = `${threeagoyear}-${threeagomonth}`;
        console.log('3개월전은? ', formattedDate);

        // 3개월 전이면서 가장 최신 데이터 가져오기
        let relevantRecord = null;
        userInfo.forEach((record) => {
            const recordDate = new Date(record.dataValues.date);
            if (recordDate <= threeMonthsAgo) {
                if (!relevantRecord || recordDate > new Date(record.dataValues.date)) {
                    relevantRecord = record;
                }
            }
        });
        let my3agobill = '';
        let my3agodate = '';
        let my3agoyear = '';
        let my3agomonth = '';

        if (relevantRecord) {
            //3개월 전데이터 있을떄
            my3agobill = relevantRecord.bill;
            my3agodate = relevantRecord.date;
            my3agoyear = my3agodate.split('-')[0];
            my3agomonth = my3agodate.split('-')[1];
        } else {
            my3agobill = null;
        }

        console.log('나의 3개월 전 데이터:', my3agodate, my3agobill);

        //주소 정보 가져오기
        let address = userInfo[0].dataValues.Residence_info.dataValues.address;
        address = `${address.split(' ')[1]} ${address.split(' ')[2]}`; //~시~구 까지 가져오기

        console.log('주소: ', address);

        const apiUrl_sigungu = `${endpoint_sigungu}?serviceKey=${OPEN_API_KEY_SIGUNGU}&type=xml&pageNo=1&numOfRows=3&locatadd_nm=${address}`;

        const responseaddress = await axios.get(apiUrl_sigungu);
        const xmlData = responseaddress.data;

        // XML 데이터로 들어옴
        const result = await parseStringPromise(xmlData);

        // 첫번째 껄로 시, 구 법정코드 뽑기
        const firstRow = result.StanReginCd.row[0];
        const sido_cd = firstRow.sido_cd[0];
        const sgg_cd = firstRow.sgg_cd[0];
        console.log(`sido_cd: ${sido_cd}, sgg_cd: ${sgg_cd}`);

        const apiUrl = `${endpoint}?year=${my3agoyear}&month=${my3agomonth}&metroCd=${sido_cd}&cityCd=${sgg_cd}&apiKey=${OPEN_API_KEY}&returnType=json`;

        const response = await axios.get(apiUrl);
        const data = response.data.data;
        const apidata = data[0].bill;

        let apibill = null;
        if (apidata) {
            apibill = apidata;
        }

        //3개월전 동네 평균
        const countryInfo = await User_info.findAll({
            where: {
                date: my3agodate,
            },
            include: [
                {
                    model: Residence_info,
                    where: {
                        address: {
                            [Op.like]: '%' + address + '%', // '%'는 와일드카드로 사용됩니다.
                        },
                    },
                },
            ],
        });

        console.log('동네인포:', countryInfo);

        //동네평균?
        const bills = countryInfo.map((info) => info.bill);
        const averageBill = bills.reduce((total, bill) => total + bill, 0) / bills.length;
        console.log('bill 값의 평균:', averageBill);

        res.json({
            date: my3agodate,
            mybill: my3agobill,
            countrybill: averageBill,
            apibill: apibill,
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;
