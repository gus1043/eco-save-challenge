const Sequelize = require('sequelize');

class User_info extends Sequelize.Model {
    static initiate(sequelize) {
        User_info.init(
            {
                consult: {
                    type: Sequelize.TEXT,
                    allowNull: true,
                },
                month: {
                    type: Sequelize.INTEGER.UNSIGNED,
                    allowNull: false,
                    primaryKey: true,
                },
                user: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    primaryKey: true,
                },
                bill: {
                    type: Sequelize.FLOAT,
                    allowNull: true,
                },
            },
            {
                sequelize,
                timestamps: true,
                underscored: false,
                modelName: 'User_info',
                tableName: 'user_info',
                paranoid: true,
                charset: 'utf8',
                collate: 'utf8_general_ci',
            }
        );
    }

    static associate(db) {
        db.User_info.belongsTo(db.User, { foreignKey: 'user', targetKey: 'email' });
    }
}

module.exports = User_info;
