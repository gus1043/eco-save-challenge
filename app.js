const express = require('express');
const path = require('path');
const morgan = require('morgan');
const nunjucks = require('nunjucks');

const { sequelize } = require('./models');
const indexRouter = require('./routes');
const wikisRouter = require('./routes/wikis');

const app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
nunjucks.configure('views', {
    express: app,
    watch: true,
});
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
    res.render('home', { title: 'Home' });
});
app.get('/home', (req, res) => {
    res.render('home', { title: 'Home' });
});
app.get('/mypage', (req, res) => {
    res.render('mypage', { title: 'MyPage' });
});
app.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});
app.get('/signup', (req, res) => {
    res.render('signup', { title: 'Signup' });
});

app.get('/community', (req, res) => {
    res.render('community', { title: 'Community' });
});
app.use('/', indexRouter);
app.use('/wikis', wikisRouter);

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
