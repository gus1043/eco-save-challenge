const Sequelize = require('sequelize');

class Residence_info extends Sequelize.Model {
    static initiate(sequelize) {
        Residence_info.init(
            {
                address: {
                    type: Sequelize.TEXT,
                    allowNull: true,
                },
                nickname: {
                    type: Sequelize.TEXT,
                    allowNull: true,
                },
                house_structure: {
                    type: Sequelize.TEXT,
                    allowNull: true,
                },
                num_member: {
                    type: Sequelize.INTEGER.UNSIGNED,
                    allowNull: true,
                },
                electrical_appliance: {
                    type: Sequelize.INTEGER.UNSIGNED,
                    allowNull: true,
                },
                age: {
                    type: Sequelize.INTEGER.UNSIGNED,
                    allowNull: true,
                },
                agree: {
                    type: Sequelize.BOOLEAN,
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
            },
            {
                sequelize,
                timestamps: false,
                underscored: false,
                modelName: 'Residence_info',
                tableName: 'residence_info',
                paranoid: true,
                charset: 'utf8',
                collate: 'utf8_general_ci',
            }
        );
    }

    static associate(db) {
        db.Residence_info.belongsTo(db.User, { foreignKey: 'user', targetKey: 'email', onDelete: 'CASCADE' });
        db.Residence_info.belongsTo(db.User_info, { foreignKey: 'user', targetKey: 'user' });
    }
}

module.exports = Residence_info;
