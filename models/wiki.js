const Sequelize = require('sequelize');

class Wiki extends Sequelize.Model {
    static initiate(sequelize) {
        Wiki.init(
            {
                created_at: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.NOW,
                },
                content: {
                    type: Sequelize.TEXT,
                    allowNull: false,
                },
            },
            {
                sequelize,
                timestamps: false,
                modelName: 'Wiki',
                tableName: 'wikis',
                paranoid: false,
                charset: 'utf8mb4',
                collate: 'utf8mb4_general_ci',
            }
        );
    }
}

module.exports = Wiki;
