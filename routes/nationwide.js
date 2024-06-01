const express = require('express');
const axios = require('axios');

const router = express.Router();

const OPEN_API_KEY = process.env.OPEN_API_KEY;
const endpoint = 'https://bigdata.kepco.co.kr/openapi/v1/powerUsage/contractType.do';

router
    .route('/')
    .get(async (req, res, next) => {
        res.render('nationwide', { title: '전국 챌린지', user: req.user });
    })
    .post(async (req, res, next) => {
        try {
            const { year, month, country } = req.body;
            const apiUrl = `${endpoint}?year=${year}&month=${month}&metroCd=${country}&apiKey=${OPEN_API_KEY}&returnType=json`;

            const contractTypes = [
                { cntrCd: 100, name: '주택용' },
                { cntrCd: 200, name: '일반용' },
                { cntrCd: 250, name: '교육용' },
                { cntrCd: 300, name: '산업용' },
                { cntrCd: 500, name: '농사용' },
                { cntrCd: 600, name: '가로등' },
            ];

            let categorizedResults = {};

            for (let type of contractTypes) {
                const response = await axios.get(`${apiUrl}&cntrCd=${type.cntrCd}`);

                const data = response.data.data;
                if (Array.isArray(data)) {
                    // 각 카테고리별로 bill 값 기준 상위 10개 데이터 추출
                    const top10 = data
                        .sort((a, b) => b.bill - a.bill)
                        .slice(0, 10)
                        .map((item) => ({
                            year: item.year,
                            month: item.month,
                            metro: item.metro,
                            city: item.city,
                            cntr: type.name,
                            custCnt: item.custCnt,
                            powerUsage: item.powerUsage,
                            bill: item.bill,
                            unitCost: item.unitCost,
                        }));

                    categorizedResults[type.name] = top10;
                    //console.log(categorizedResults);
                } else {
                    console.error(`Expected array but got ${typeof data}`);
                }
            }

            res.json({ data: categorizedResults });
        } catch (error) {
            console.error(error);
            res.status(500).send('API 호출 중 에러가 발생했습니다.');
        }
    });

module.exports = router;
