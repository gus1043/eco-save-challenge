const express = require('express');
const User = require('../models/user');
const User_info = require('../models/user_info');
const Residence_info = require('../models/residence_info');

const router = express.Router();

//메인페이지
router.get('/', async (req, res, next) => {
    try {
        let bill = null;
        let userInfo = null;

        if (req.user !== undefined) {
            // 유저 정보 가져오기
            userInfo = await User_info.findOne({
                where: { user: req.user.email },
                order: [['date', 'DESC']],
                limit: 1,
            });
            // 등록된 bill
            if (userInfo && userInfo.bill !== null) {
                // userInfo가 null이 아니고 bill이 null이 아닌 경우
                bill = userInfo.bill;
            }
        }

        console.log(req.user);
        console.log(userInfo);

        res.render('home', { title: '홈', user: req.user, bill: bill });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.get('/mychallenge', async (req, res, next) => {
    try {
        //유저 정보 가져오기
        const seconduserInfo = await User_info.findOne({
            where: { user: req.user.email },
            order: [['date', 'DESC']],
            offset: 1, // 두 번째로 큰 항목 선택
            limit: 1,
        });

        const latestuserInfo = await User_info.findAll({
            where: { user: req.user.email },
            order: [['date', 'DESC']],
            limit: 1,
            include: [
                {
                    model: Residence_info,
                },
            ],
        });

        console.log('최신정보', latestuserInfo);
        console.log('최신정보 날짜뽑기');
        console.log('테스트', latestuserInfo[0].dataValues.Residence_info);
        console.log('테스트2');

        const date = latestuserInfo[0].dataValues.date;
        const age = latestuserInfo[0].dataValues.Residence_info.dataValues.age;

        const countryInfo = await User_info.findAll({
            where: { date: date },
        });

        console.log('전체인포:', countryInfo);

        const ageInfo = await User_info.findAll({
            where: {
                date: date,
            },
            include: [
                {
                    model: Residence_info,
                    where: {
                        age: age,
                    },
                },
            ],
        });

        console.log('나이대인포:', ageInfo);

        let difference = null; // 변수를 먼저 선언하고 null로 초기화

        //지난달보다 아낀 수
        if (latestuserInfo.length === 2) {
            const latestBill = latestuserInfo[0].dataValues.bill;
            const previousBill = seconduserInfo.bill;
            difference = latestBill - previousBill;
            console.log('지난 달보다 아낀 정도:', difference);
        } else {
            difference = null;
        }

        // 상위 퍼센트 불러오기
        // 동네 상위 몇퍼센트?
        const bills = countryInfo.map((info) => info.bill);
        const sortedBills = bills.sort((a, b) => a - b);
        const percentRank = ((sortedBills.indexOf(latestuserInfo[0].dataValues.bill) + 1) / sortedBills.length) * 100;
        console.log('동네 상위:', percentRank);
        const averageBill = bills.reduce((total, bill) => total + bill, 0) / bills.length;
        console.log('bill 값의 평균:', averageBill);

        // 나이대 상위 몇퍼센트?
        const agebills = ageInfo.map((info) => info.bill);
        const sortedageBills = agebills.sort((a, b) => a - b);
        const agepercentRank =
            ((sortedageBills.indexOf(latestuserInfo[0].dataValues.bill) + 1) / sortedageBills.length) * 100;
        console.log('나이대 상위 몇퍼센트: ', agepercentRank);
        const ageaveragebills = bills.reduce((total, bill) => total + bill, 0) / bills.length;
        console.log('bill 값의 평균:', ageaveragebills);

        // 결과를 JSON으로 응답
        res.json({
            date: date,
            age: age,
            mybill: latestuserInfo[0].dataValues.bill,
            savingsLastMonth: difference,
            averageBill: averageBill,
            ageaveragebills: ageaveragebills,
            countryPercentRank: percentRank,
            agePercentRank: agepercentRank,
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

//우리동네 절약 랭킹
router.get('/countrychallenge', async (req, res, next) => {
    try {
        //유저 정보 가져오기
        const userInfo = await User_info.findAll({
            where: { user: req.user.email },
            order: [['date', 'DESC']],
            limit: 1,
            include: [
                {
                    model: Residence_info,
                },
            ],
        });
        const date = userInfo[0].dataValues.date;
        const address = userInfo[0].dataValues.Residence_info.dataValues.address;

        // 주소를 공백을 기준으로 나눕니다.
        var parts = address.split(' ');
        // 앞의 네 부분만 가져와서 다시 합칩니다.
        var shortenedAddress = parts.slice(0, 3).join(' ');

        console.log('되나', date, shortenedAddress);
        const { Op } = require('sequelize');

        const countryInfo = await User_info.findAll({
            where: {
                date: date,
            },
            include: [
                {
                    model: Residence_info,
                    where: {
                        address: {
                            [Op.like]: '%' + shortenedAddress + '%', // '%'는 와일드카드로 사용됩니다.
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
            mybill: userInfo[0].dataValues.bill,
            avgbill: averageBill,
            alluser: countryInfo,
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

//전체 절약 랭킹
router.get('/userschallenge', async (req, res, next) => {
    try {
        //유저 정보 가져오기
        const userInfo = await User_info.findAll({
            where: { user: req.user.email },
            order: [['date', 'DESC']],
            limit: 1,
            include: [
                {
                    model: Residence_info,
                },
            ],
        });
        const date = userInfo[0].dataValues.date;

        const allusersInfo = await User_info.findAll({
            where: { date: date },
        });

        //전체 유저 평균?
        const bills = allusersInfo.map((info) => info.bill);
        const averageBill = bills.reduce((total, bill) => total + bill, 0) / bills.length;
        console.log('bill 값의 평균:', averageBill);

        res.json({
            mybill: userInfo[0].dataValues.bill,
            avgbill: averageBill,
            alluser: allusersInfo,
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;
