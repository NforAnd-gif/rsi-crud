import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Stall extends Model {
    declare id: number;
    declare owner_id: number;
    declare name: string;
    declare category: string;
    declare location: string;
    declare description: string | null;
    declare avg_rating: number;
    declare review_count: number;
    declare created_at: Date;
}

Stall.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        owner_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        name: {
            type: DataTypes.STRING(150),
            allowNull: false
        },

        category: {
            type: DataTypes.STRING(100),
            allowNull: false
        },

        location: {
            type: DataTypes.STRING(200),
            allowNull: false
        },

        description: {
            type: DataTypes.STRING(500),
            allowNull: true
        },

        avg_rating: {
            type: DataTypes.DECIMAL(3, 2),
            allowNull: false
        },

        review_count: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        created_at: {
            type: DataTypes.DATE,
            allowNull: false
        }
    },
    {
        sequelize,
        tableName: 'STALLS',
        timestamps: false
    }
);

export default Stall;