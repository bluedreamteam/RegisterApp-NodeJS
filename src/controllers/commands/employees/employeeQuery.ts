import * as Helper from "../helpers/helper";
import { EmployeeModel } from "../models/employeeModel";
import * as EmployeeHelper from "./helpers/employeeHelper";
import * as EmployeeRepository from "../models/employeeModel";
import { Resources, ResourceKey } from "../../../resourceLookup";
import { CommandResponse, Employee } from "../../typeDefinitions";

export const queryById = async (recordId?: string): Promise<CommandResponse<Employee>> => {
	if (Helper.isBlankString(recordId)) {
		return Promise.reject(<CommandResponse<Employee>>{
			status: 422,
			message: Resources.getString(ResourceKey.EMPLOYEE_RECORD_ID_INVALID)
		});
	}

	return EmployeeRepository.queryById(<string>recordId)
		.then((queriedEmployee: (EmployeeModel | null)): Promise<CommandResponse<Employee>> => {
			if (!queriedEmployee) {
				return Promise.reject(<CommandResponse<Employee>>{
					status: 404,
					message: Resources.getString(ResourceKey.EMPLOYEE_NOT_FOUND)
				});
			}

			return Promise.resolve(<CommandResponse<Employee>>{
				status: 200,
				data: EmployeeHelper.mapEmployeeData(queriedEmployee)
			});
		});
};

export const queryByEmployeeId = async (
	employeeId?: string
): Promise<CommandResponse<Employee>> => {

	if (Helper.isBlankString(employeeId) || isNaN(Number(employeeId))) {
		return Promise.reject(<CommandResponse<Employee>>{
			status: 422,
			message: Resources.getString(ResourceKey.EMPLOYEE_EMPLOYEE_ID_INVALID)
		});
	}

	return EmployeeRepository.queryByEmployeeId(Number(employeeId))
		.then((queriedEmployee: (EmployeeModel | null)): Promise<CommandResponse<Employee>> => {
			if (!queriedEmployee) {
				return Promise.reject(<CommandResponse<Employee>>{
					status: 404,
					message: Resources.getString(ResourceKey.EMPLOYEE_NOT_FOUND)
				});
			}

			return Promise.resolve(<CommandResponse<Employee>>{
				status: 200,
				data: EmployeeHelper.mapEmployeeData(queriedEmployee)
			});
		});
};
