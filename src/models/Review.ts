import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Review extends Model {
    declare id: number;
    declare stall_id: number;
    declare user_id: number;
    declare rating: number;
    declare comment: string | null;
    declare like_count: number;
    declare created_at: Date;
    declare updated_at: Date;
}

Review.init(
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

        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        rating: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        comment: {
            type: DataTypes.STRING(1000),
            allowNull: true
        },

        like_count: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        created_at: {
            type: DataTypes.DATE,
            allowNull: false
        },

        updated_at: {
            type: DataTypes.DATE,
            allowNull: false
        }
    },
    {
        sequelize,
        tableName: 'REVIEWS',
        timestamps: false
    }
);

export default Review;