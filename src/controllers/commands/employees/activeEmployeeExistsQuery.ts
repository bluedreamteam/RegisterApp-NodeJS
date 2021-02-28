import { EmployeeModel } from "../models/employeeModel";
import { CommandResponse } from "../../typeDefinitions";
import * as EmployeeRepository from "../models/employeeModel";
import { Resources, ResourceKey } from "../../../resourceLookup";

// Search for employee returns true if found
export const query = async (): Promise<CommandResponse<boolean>> => {
	return EmployeeRepository.queryActiveExists() // Searches employee repository for employee
		.then((queriedEmployee: (EmployeeModel | null)): CommandResponse<boolean> => {
			if (!queriedEmployee) { // If queried Employee isn't found
				return <CommandResponse<boolean>>{ // Return promise as false
					status: 404, // status Not Found
					message: Resources.getString(ResourceKey.EMPLOYEE_NOT_FOUND)
				};
			}

			return <CommandResponse<boolean>>{ // Return promise as true
				data: true,
				status: 200 // status ok
			};
		});
};
