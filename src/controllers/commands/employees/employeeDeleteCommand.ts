import Sequelize from "sequelize";
import * as Helper from "../helpers/helper";
import { EmployeeModel } from "../models/employeeModel";
import { CommandResponse } from "../../typeDefinitions";
import * as EmployeeRepository from "../models/employeeModel";
import { Resources, ResourceKey } from "../../../resourceLookup";
import * as DatabaseConnection from "../models/databaseConnection";

export const execute = async (employeeId?: string): Promise<CommandResponse<void>> => {
	if (Helper.isBlankString(employeeId)) {
		return Promise.resolve(<CommandResponse<void>>{ status: 204 });
	}

	let deleteTransaction: Sequelize.Transaction;

	return DatabaseConnection.createTransaction()
		.then((createdTransaction: Sequelize.Transaction): Promise<EmployeeModel | null> => {
			deleteTransaction = createdTransaction;

			return EmployeeRepository.queryById(
				<string>employeeId,
				deleteTransaction);
		}).then((queriedEmployee: (EmployeeModel | null)): Promise<void> => {
			if (queriedEmployee == null) {
				return Promise.resolve();
			}

			return queriedEmployee.destroy(
				<Sequelize.DestroyOptions>{
					transaction: deleteTransaction
				});
		}).then((): CommandResponse<void> => {
			deleteTransaction.commit();

			return <CommandResponse<void>>{ status: 204 };
		}).catch((error: any): Promise<CommandResponse<void>> => {
			if (deleteTransaction != null) {
				deleteTransaction.rollback();
			}

			return Promise.reject(<CommandResponse<void>>{
				status: (error.status || 500),
				message: (error.message
					|| Resources.getString(ResourceKey.EMPLOYEE_UNABLE_TO_DELETE))
			});
		});
};
