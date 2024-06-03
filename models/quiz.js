const Sequelize = require('sequelize');

class Quiz extends Sequelize.Model {
    static initiate(sequelize) {
        Quiz.init(
            {
                quiz: {
                    type: Sequelize.TEXT,
                    allowNull: false,
                },
                answer: {
                    type: Sequelize.TEXT,
                    allowNull: false,
                },
            },
            {
                sequelize,
                timestamps: false,
                underscored: false,
                modelName: 'Quiz',
                tableName: 'quizes',
                paranoid: true,
                charset: 'utf8',
                collate: 'utf8_general_ci',
            }
        );
    }
}

module.exports = Quiz;
