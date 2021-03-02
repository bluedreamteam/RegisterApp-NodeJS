import Sequelize from "sequelize";
import { DatabaseConnection } from "./databaseConnection";
import { EmployeeFieldName, DatabaseTableName } from "./constants/databaseNames";
import { Model, DataTypes, InitOptions, ModelAttributes, ModelAttributeColumnOptions } from "sequelize";

export class EmployeeModel extends Model {
	public active!: boolean;
	public lastName!: string;
	public password!: Buffer;
	public firstName!: string;
	public managerId!: string;
	public employeeId!: number;
	public classification!: number;

	public readonly id!: string;
	public readonly createdOn!: Date;
}

EmployeeModel.init(
	<ModelAttributes>{
		id: <ModelAttributeColumnOptions>{
			field: EmployeeFieldName.ID,
			type: Sequelize.UUID,
			autoIncrement: true,
			primaryKey: true
		},
		active: <ModelAttributeColumnOptions>{
			field: EmployeeFieldName.Active,
			type: Sequelize.BOOLEAN,
			allowNull: true
		},
		lastName: <ModelAttributeColumnOptions>{
			field: EmployeeFieldName.LastName,
			type: new DataTypes.STRING(128),
			allowNull: true
		},
		password: <ModelAttributeColumnOptions>{
			field: EmployeeFieldName.Password,
			type: Sequelize.BLOB,
			allowNull: true
		},
		createdOn: <ModelAttributeColumnOptions>{
			field: EmployeeFieldName.CreatedOn,
			type: new DataTypes.DATE(),
			allowNull: true
		},
		firstName: <ModelAttributeColumnOptions>{
			field: EmployeeFieldName.FirstName,
			type: new DataTypes.STRING(128),
			allowNull: true
		},
		managerId: <ModelAttributeColumnOptions>{
			field: EmployeeFieldName.ManagerId,
			type: Sequelize.UUID,
			allowNull: true
		},
		employeeId: <ModelAttributeColumnOptions>{
			field: EmployeeFieldName.EmployeeId,
			type: Sequelize.INTEGER,
			allowNull: true
		},
		classification: <ModelAttributeColumnOptions>{
			field: EmployeeFieldName.Classification,
			type: Sequelize.INTEGER,
			allowNull: true
		}
	}, <InitOptions>{
		timestamps: false,
		freezeTableName: true,
		sequelize: DatabaseConnection,
		tableName: DatabaseTableName.EMPLOYEE
	});


// Database interaction
export const queryById = async (
	id: string,
	queryTransaction?: Sequelize.Transaction
): Promise<EmployeeModel | null> => {

	return EmployeeModel.findOne(<Sequelize.FindOptions>{
		transaction: queryTransaction,
		where: <Sequelize.WhereAttributeHash>{ id: id }
	});
};

export const queryByEmployeeId = async (
	employeeId: number,
	queryTransaction?: Sequelize.Transaction
): Promise<EmployeeModel | null> => {

	return EmployeeModel.findOne(<Sequelize.FindOptions>{
		transaction: queryTransaction,
		where: <Sequelize.WhereAttributeHash>{ employeeId: employeeId }
	});
};

export const queryActive = async (): Promise<EmployeeModel[]> => {
	return EmployeeModel.findAll(<Sequelize.FindOptions>{
		order: [ [EmployeeFieldName.CreatedOn, "ASC"] ],
		where: <Sequelize.WhereAttributeHash>{ active: true }
	});
};

export const queryActiveExists = async (): Promise<EmployeeModel | null> => {
	return EmployeeModel.findOne(<Sequelize.FindOptions>{
		where: <Sequelize.WhereAttributeHash>{ active: true }
	});
};
