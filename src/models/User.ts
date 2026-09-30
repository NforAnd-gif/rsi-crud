import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class User extends Model {
    declare id: number;
    declare name: string;
    declare email: string;
    declare password_hash: string;
    declare role: 'admin' | 'owner' | 'customer';
    declare created_at: Date;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },

        email: {
            type: DataTypes.STRING(150),
            allowNull: false
        },

        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false
        },

        role: {
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
        tableName: 'USERS',
        timestamps: false
    }
);

export default User;