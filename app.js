const express = require('express');
const path = require('path');
const morgan = require('morgan');
const ejs = require('ejs');
require('dotenv').config();

const { sequelize } = require('./models');
const indexRouter = require('./routes');
const wikisRouter = require('./routes/wikis');
const usersRouter = require('./routes/users');

const app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
const logo = { img: '/images/logo.png' };

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
// 라우터 등록
app.get('/', (req, res) => {
    res.render('home', { title: 'Home', logo: logo });
});
app.get('/home', (req, res) => {
    res.render('home', { title: 'Home', logo: logo });
});
app.get('/mypage', (req, res) => {
    res.render('mypage', { title: 'MyPage', logo: logo });
});
app.get('/login', (req, res) => {
    res.render('login', { title: 'Login', logo: logo });
});
app.get('/signup', (req, res) => {
    res.render('signup', { title: 'Signup', logo: logo });
});

app.get('/residenceInfo', (req, res) => {
    res.render('residenceInfo', { title: 'residenceInfo', logo: logo });
});

app.get('/community', (req, res) => {
    res.render('community', { title: 'Community', logo: logo });
});

app.use('/', indexRouter);
app.use('/wikis', wikisRouter);
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
