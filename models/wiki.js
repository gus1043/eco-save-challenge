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
                timestamps: true,
                underscored: false,
                modelName: 'Wiki',
                tableName: 'wikis',
                paranoid: true,
                charset: 'utf8',
                collate: 'utf8_general_ci',
            }
        );
    }
    static associate(db) {
        db.Wiki.belongsTo(db.User, { foreignKey: 'user', targetKey: 'email' });
    }
}

module.exports = Wiki;
