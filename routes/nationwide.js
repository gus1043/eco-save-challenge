const express = require('express');
const axios = require('axios');

const router = express.Router();
require('dotenv').config();

const HOST = 'https://bigdata.kepco.co.kr/openapi/v1/powerUsage/contractType.do';
const apiKey = process.env.OPEN_API_KEY;

router.route('/').get(async (req, res, next) => {
    try {
        // OpenAPI URL
        const apiUrl = 'Enter_the_OpenAPI_URL_here';

        // API 키를 환경 변수에서 가져옵니다.
        const apiKey = process.env.OPEN_API_KEY;

        // axios를 사용하여 OpenAPI 호출
        const response = await axios.get(apiUrl, {
            headers: {
                Authorization: `Bearer ${apiKey}`, // API 키를 헤더에 추가
            },
        });

        // OpenAPI에서 받은 데이터를 클라이언트에 응답으로 보냅니다.
        res.status(200).json(response.data);
        res.render('nationwide', { title: '전국 챌린지' });
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;
