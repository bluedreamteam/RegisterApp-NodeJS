import Sequelize from "sequelize";
import * as Helper from "../helpers/helper";
import { EmployeeModel } from "../models/employeeModel";
import * as EmployeeHelper from "./helpers/employeeHelper";
import * as EmployeeRepository from "../models/employeeModel";
import { Resources, ResourceKey } from "../../../resourceLookup";
import * as DatabaseConnection from "../models/databaseConnection";
import { EmployeeClassification } from "../models/constants/entityTypes";
import { CommandResponse, Employee, EmployeeSaveRequest } from "../../typeDefinitions";

const buildUpdateObject = (employeeSaveRequest: EmployeeSaveRequest): Object => {
	const updateObject: any = {};

	if (employeeSaveRequest.active != null) {
		updateObject.active = employeeSaveRequest.active;
	}
	if (employeeSaveRequest.lastName != null) {
		updateObject.lastName = employeeSaveRequest.lastName;
	}
	if (employeeSaveRequest.firstName != null) {
		updateObject.firstName = employeeSaveRequest.firstName;
	}
	if (!Helper.isBlankString(employeeSaveRequest.password)) {
		updateObject.password = Buffer.from(EmployeeHelper.hashString(employeeSaveRequest.password));
	}
	if (employeeSaveRequest.classification != null) {
		updateObject.classification = <EmployeeClassification>employeeSaveRequest.classification;
	}
	if (!Helper.isBlankString(employeeSaveRequest.managerId)
		&& Helper.isValidUUID(<string>employeeSaveRequest.managerId)) {

		updateObject.managerId = employeeSaveRequest.managerId;
	}

	return updateObject;
};

const validateSaveRequest = (employeeSaveRequest: EmployeeSaveRequest): CommandResponse<Employee> => {
	let errorMessage: string = "";

	if ((employeeSaveRequest.firstName != null)
		&& (employeeSaveRequest.firstName.trim() === "")) {

		errorMessage = Resources.getString(ResourceKey.EMPLOYEE_FIRST_NAME_INVALID);
	} else if ((employeeSaveRequest.lastName != null)
		&& (employeeSaveRequest.lastName.trim() === "")) {

		errorMessage = Resources.getString(ResourceKey.EMPLOYEE_LAST_NAME_INVALID);
	} else if ((employeeSaveRequest.password != null)
		&& (employeeSaveRequest.password.trim() === "")) {

		errorMessage = Resources.getString(ResourceKey.EMPLOYEE_PASSWORD_INVALID);
	} else if ((employeeSaveRequest.classification != null)
		&& (isNaN(employeeSaveRequest.classification)
		|| !(employeeSaveRequest.classification in EmployeeClassification))) {

		errorMessage = Resources.getString(ResourceKey.EMPLOYEE_TYPE_INVALID);
	} else if ((employeeSaveRequest.managerId != null)
		&& !Helper.isValidUUID(employeeSaveRequest.managerId)) {

		errorMessage = Resources.getString(ResourceKey.EMPLOYEE_MANAGER_ID_INVALID);
	}

	return ((errorMessage === "")
		? <CommandResponse<Employee>>{ status: 200 }
		: <CommandResponse<Employee>>{
			status: 422,
			message: errorMessage
		});
};

export const execute = async (
	employeeSaveRequest: EmployeeSaveRequest
): Promise<CommandResponse<Employee>> => {

	const validationResponse: CommandResponse<Employee> =
		validateSaveRequest(employeeSaveRequest);
	if (validationResponse.status !== 200) {
		return Promise.reject(validationResponse);
	}

	let updateTransaction: Sequelize.Transaction;

	return DatabaseConnection.createTransaction()
		.then((createdTransaction: Sequelize.Transaction): Promise<EmployeeModel | null> => {
			updateTransaction = createdTransaction;

			return EmployeeRepository.queryById(
				<string>employeeSaveRequest.id,
				updateTransaction);
		}).then((queriedEmployee: (EmployeeModel | null)): Promise<EmployeeModel> => {
			if (queriedEmployee == null) {
				return Promise.reject(<CommandResponse<Employee>>{
					status: 404,
					message: Resources.getString(ResourceKey.EMPLOYEE_NOT_FOUND)
				});
			}

			return queriedEmployee.update(
				buildUpdateObject(employeeSaveRequest),
				<Sequelize.InstanceUpdateOptions>{
					transaction: updateTransaction
				});
		}).then((updatedEmployee: EmployeeModel): CommandResponse<Employee> => {
			updateTransaction.commit();

			return <CommandResponse<Employee>>{
				status: 200,
				data: EmployeeHelper.mapEmployeeData(updatedEmployee)
			};
		}).catch((error: any): Promise<CommandResponse<Employee>> => {
			if (updateTransaction != null) {
				updateTransaction.rollback();
			}

			return Promise.reject(<CommandResponse<Employee>>{
				status: (error.status || 500),
				message: (error.messsage
					|| Resources.getString(ResourceKey.EMPLOYEE_UNABLE_TO_SAVE))
			});
		});
};
