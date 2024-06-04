const express = require('express');
const Wiki = require('../models/wiki');
const Chat = require('../models/chat');

const router = express.Router();
router
    .route('/')
    .get(async (req, res, next) => {
        let chats; // chats 변수를 블록 외부에서 선언
        try {
            // 전체 데이터를 가져오기
            chats = await Chat.findAll();
        } catch (err) {
            console.error(err);
            next(err);
            return; // 에러가 발생했을 때 이후 코드를 실행하지 않도록 return
        }

        console.log('유저는? ', req.session.color);
        res.render('community', { title: '커뮤니티', chats: chats, user: req.session.color });
    })
    .post(async (req, res, next) => {
        try {
            // 채팅 메시지를 데이터베이스에 저장
            const chat = await Chat.create({
                user: req.session.color,
                chat: req.body.chat,
            });
        } catch (error) {
            console.error(error);
            next(error);
        }
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
