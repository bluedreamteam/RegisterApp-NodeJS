import Sequelize from "sequelize";
import { DatabaseConnection } from "./databaseConnection";
import { ActiveUserFieldName, DatabaseTableName } from "./constants/databaseNames";
import { Model, DataTypes, InitOptions, ModelAttributes, ModelAttributeColumnOptions } from "sequelize";

export class ActiveUserModel extends Model {
	public name!: string;
	public employeeId!: string;
	public sessionKey!: string;
	public classification!: number;

	public readonly id!: string;
	public readonly createdOn!: Date;
}

ActiveUserModel.init(
	<ModelAttributes>{
		id: <ModelAttributeColumnOptions>{
			field: ActiveUserFieldName.ID,
			type: Sequelize.UUID,
			autoIncrement: true,
			primaryKey: true
		},
		name: <ModelAttributeColumnOptions>{
			field: ActiveUserFieldName.Name,
			type: new DataTypes.STRING(256),
			allowNull: true
		},
		createdOn: <ModelAttributeColumnOptions>{
			field: ActiveUserFieldName.CreatedOn,
			type: new DataTypes.DATE(),
			allowNull: true
		},
		employeeId: <ModelAttributeColumnOptions>{
			field: ActiveUserFieldName.EmployeeId,
			type: Sequelize.UUID,
			allowNull: true
		},
		sessionKey: <ModelAttributeColumnOptions>{
			field: ActiveUserFieldName.SessionKey,
			type: new DataTypes.STRING(128),
			allowNull: true
		},
		classification: <ModelAttributeColumnOptions>{
			field: ActiveUserFieldName.Classification,
			type: Sequelize.INTEGER,
			allowNull: true
		}
	}, <InitOptions>{
		timestamps: false,
		freezeTableName: true,
		sequelize: DatabaseConnection,
		tableName: DatabaseTableName.ACTIVE_USER
	});


// Database interaction
export const queryById = async (
	id: string,
	queryTransaction?: Sequelize.Transaction
): Promise<ActiveUserModel | null> => {

	return ActiveUserModel.findOne(<Sequelize.FindOptions>{
		transaction: queryTransaction,
		where: <Sequelize.WhereAttributeHash>{ id: id }
	});
};

export const queryBySessionKey = async (
	sessionKey: string,
	queryTransaction?: Sequelize.Transaction
): Promise<ActiveUserModel | null> => {

	return ActiveUserModel.findOne(<Sequelize.FindOptions>{
		transaction: queryTransaction,
		where: <Sequelize.WhereAttributeHash>{ sessionKey: sessionKey }
	});
};

export const queryByEmployeeId = async (
	employeeId: string,
	queryTransaction?: Sequelize.Transaction
): Promise<ActiveUserModel | null> => {

	return ActiveUserModel.findOne(<Sequelize.FindOptions>{
		transaction: queryTransaction,
		where: <Sequelize.WhereAttributeHash>{ employeeId: employeeId }
	});
};
