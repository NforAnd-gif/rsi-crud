import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Like extends Model {
    declare id: number;
    declare review_id: number;
    declare user_id: number;
    declare created_at: Date;
}

Like.init(
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

        user_id: {
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
        tableName: 'LIKES',
        timestamps: false
    }
);

export default Like;