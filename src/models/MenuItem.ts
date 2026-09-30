import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class MenuItem extends Model {
    declare id: number;
    declare stall_id: number;
    declare name: string;
    declare price: number;
    declare is_available: boolean;
}

MenuItem.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        stall_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        name: {
            type: DataTypes.STRING(150),
            allowNull: false
        },

        price: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false
        },

        is_available: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    },
    {
        sequelize,
        tableName: 'MENU_ITEMS',
        timestamps: false
    }
);

export default MenuItem;