//수업참여0521 - 최지현60211704
const Sequelize = require('sequelize');

class User extends Sequelize.Model {
    static initiate(sequelize) {
        User.init(
            {
                id: {
                    type: Sequelize.STRING(20),
                    allowNull: false,
                    unique: fasle,
                },
                password: {
                    type: Sequelize.TEXT,
                    allowNull: false,
                },
                age: {
                    type: Sequelize.INTEGER.UNSIGNED,
                    allowNull: true,
                },
                address: {
                    type: Sequelize.TEXT,
                    allowNull: true,
                },
            },
            {
                sequelize,
                timestamps: false,
                underscored: false,
                modelName: 'User',
                tableName: 'users',
                paranoid: false,
                charset: 'utf8',
                collate: 'utf8_general_ci',
            }
        );
    }

    static associate(db) {
        db.User.hasMany(db.Comment, { foreignKey: 'commenter', sourceKey: 'id' });
    }
}

module.exports = User;
