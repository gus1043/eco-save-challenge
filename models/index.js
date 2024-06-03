const Sequelize = require('sequelize');
const User = require('./user');
const Residence_info = require('./residence_info');
const User_info = require('./user_info');
const Wiki = require('./wiki');
const Quiz = require('./quiz');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;

db.User = User;
db.Residence_info = Residence_info;
db.User_info = User_info;
db.Wiki = Wiki;
db.Quiz = Quiz;

User.initiate(sequelize);
Residence_info.initiate(sequelize);
User_info.initiate(sequelize);
Wiki.initiate(sequelize);
Quiz.initiate(sequelize);

User.associate(db);
User_info.associate(db);
Residence_info.associate(db);

module.exports = db;
