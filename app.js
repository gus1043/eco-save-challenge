const express = require('express');
const path = require('path');
const morgan = require('morgan');
const ejs = require('ejs');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const dotenv = require('dotenv');
const passport = require('passport');

dotenv.config();

const { sequelize } = require('./models');
const indexRouter = require('./routes');
const communityRouter = require('./routes/community');
const usersRouter = require('./routes/users');

const app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

sequelize
    .sync({ force: false })
    .then(() => {
        console.log('데이터베이스 연결 성공');
    })
    .catch((err) => {
        console.error(err);
    });

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
    session({
        resave: false,
        saveUninitialized: false,
        secret: process.env.COOKIE_SECRET,
        cookie: {
            httpOnly: true,
            secure: false,
        },
    })
);

// passport 초기화 & 세션 미들웨어 실행
app.use(passport.initialize());
app.use(passport.session());

// ejs render 등록 - router 나오는 대로 수정 필요
app.get('/nationwide', (req, res) => {
    res.render('nationwide', { title: '전국 챌린지', logo: logo });
});
app.get('/mypage', (req, res) => {
    res.render('mypage', { title: '마이페이지', logo: logo });
});
app.get('/login', (req, res) => {
    res.render('login', { title: '로그인' });
});

app.get('/residenceInfo', (req, res) => {
    res.render('residenceInfo', { title: '유저 세팅', logo: logo });
});

//요청 경로에 따라 router 실행
app.use('/', indexRouter);
app.use('/community', communityRouter);
app.use('/users', usersRouter);

//404 에러처리 미들웨어
app.use((req, res, next) => {
    res.status(404).send(`${req.method} ${req.path} is NOT FOUND`);
});

// 서버 에러처리 미들웨어
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Something broke!');
});

app.listen(app.get('port'), () => {
    console.log(`http://localhost:${app.get('port')}에서 대기중`);
});
