import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Flag extends Model {
    declare id: number;
    declare review_id: number;
    declare reported_by: number;
    declare reason: string;
    declare status: 'pending' | 'resolved' | 'dismissed';
    declare created_at: Date;
}

Flag.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        review_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        reported_by: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        reason: {
            type: DataTypes.STRING(500),
            allowNull: false
        },

        status: {
            type: DataTypes.STRING(20),
            allowNull: false
        },

        created_at: {
            type: DataTypes.DATE,
            allowNull: false
        }
    },
    {
        sequelize,
        tableName: 'FLAGS',
        timestamps: false
    }
);

export default Flag;