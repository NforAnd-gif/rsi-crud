import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class AuditLog extends Model {
    declare id: number;
    declare user_id: number | null;
    declare action: string;
    declare target_table: string;
    declare target_id: number | null;
    declare metadata: string | null;
    declare created_at: Date;
}

AuditLog.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        user_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },

        action: {
            type: DataTypes.STRING(100),
            allowNull: false
        },

        target_table: {
            type: DataTypes.STRING(100),
            allowNull: false
        },

        target_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },

        metadata: {
            type: DataTypes.STRING(1000),
            allowNull: true
        },

        created_at: {
            type: DataTypes.DATE,
            allowNull: false
        }
    },
    {
        sequelize,
        tableName: 'AUDIT_LOGS',
        timestamps: false
    }
);

export default AuditLog;