import * as crypto from "crypto";
import { Employee } from "../../../typeDefinitions";
import { EmployeeModel } from "../../models/employeeModel";
import { EmployeeClassification } from "../../models/constants/entityTypes";

const employeeIdBase: string = "00000";

// Creates hash of string through sha256
export const hashString = (toHash: string): string => {
	const hash = crypto.createHash("sha256");
	hash.update(toHash);
	return hash.digest("hex");
};
// Pads string for block encryption to meet a size of 16 bit intervals
export const padEmployeeId = (employeeId: number): string => {
	const employeeIdAsString: string = employeeId.toString();

	return (employeeIdBase + employeeIdAsString)
		.slice(-Math.max(employeeIdBase.length, employeeIdAsString.length));
};
// Maps employee information from queriedEmployee
// employeeId is padded
export const mapEmployeeData = (queriedEmployee: EmployeeModel): Employee => {
	return <Employee>{ // Return Mapped employee data
		id: queriedEmployee.id,
		active: queriedEmployee.active,
		lastName: queriedEmployee.lastName,
		createdOn: queriedEmployee.createdOn,
		firstName: queriedEmployee.firstName,
		managerId: queriedEmployee.managerId,
		employeeId: padEmployeeId(queriedEmployee.employeeId),
		classification: <EmployeeClassification>queriedEmployee.classification
	};
};
// Is user a manager?
// Either Shift or General Manager
export const isElevatedUser = (employeeClassification: EmployeeClassification): boolean => {
	return ((employeeClassification === EmployeeClassification.GeneralManager)
		|| (employeeClassification === EmployeeClassification.ShiftManager));
};