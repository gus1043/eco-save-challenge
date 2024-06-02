const Sequelize = require('sequelize');

class User_info extends Sequelize.Model {
    static initiate(sequelize) {
        User_info.init(
            {
                consult: {
                    type: Sequelize.TEXT,
                    allowNull: true,
                },
                report: {
                    type: Sequelize.TEXT,
                    allowNull: true,
                },
                bill: {
                    type: Sequelize.FLOAT,
                    allowNull: true,
                },
                user: {
                    type: Sequelize.STRING(320),
                    allowNull: false,
                    onDelete: 'CASCADE', // 외래 키 삭제 옵션 설정
                    references: {
                        model: 'users', // 참조할 테이블 이름
                        key: 'email', // 참조할 열 이름
                    },
                },
                date: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
            },
            {
                sequelize,
                timestamps: false,
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
        db.User_info.belongsTo(db.User, { foreignKey: 'user', targetKey: 'email', onDelete: 'CASCADE' });
        db.User_info.hasOne(db.Residence_info, { foreignKey: 'user', sourceKey: 'user' });
    }
}

module.exports = User_info;
