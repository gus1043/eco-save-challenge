const Sequelize = require('sequelize');

class Residence_info extends Sequelize.Model {
    static initiate(sequelize) {
        Residence_info.init(
            {
                address: {
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
            },
            {
                sequelize,
                timestamps: true,
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
        db.Residence_info.belongsTo(db.User, { foreignKey: 'user', targetKey: 'email' });
    }
}

module.exports = Residence_info;
