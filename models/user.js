const Sequelize = require('sequelize');

class User extends Sequelize.Model {
    static initiate(sequelize) {
        User.init(
            {
                email: {
                    type: Sequelize.STRING(320),
                    allowNull: false,
                    unique: true,
                },
                password: {
                    type: Sequelize.TEXT,
                    allowNull: false,
                },
                name: {
                    type: Sequelize.TEXT,
                    allowNull: false,
                },
                provider: {
                    type: Sequelize.STRING(10),
                    allowNull: false,
                    defaultValue: 'local',
                },
                snsId: {
                    type: Sequelize.STRING(30),
                    allowNull: true,
                },
            },
            {
                sequelize,
                timestamps: true,
                underscored: false,
                modelName: 'User',
                tableName: 'users',
                paranoid: true,
                charset: 'utf8',
                collate: 'utf8_general_ci',
            }
        );
    }

    static associate(db) {
        db.User.hasMany(db.Residence_info, { foreignKey: 'user', sourceKey: 'email' });
        db.User.hasMany(db.User_info, { foreignKey: 'user', sourceKey: 'email' });
    }
}

module.exports = User;
