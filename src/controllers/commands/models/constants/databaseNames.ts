export enum DatabaseTableName {
	PRODUCT = "product",
	EMPLOYEE = "employee",
	ACTIVE_USER = "activeuser"
}
/***************************************/

export enum ProductFieldName {
	ID = "id",
	COUNT = "count",
	CREATED_ON = "createdon",
	LOOKUP_CODE = "lookupcode"
}
// /*************************************/
// export enum EmployeeFieldName {
// 	ID = "id",
// 	FirstName = "firstname",
// 	LastName = "lastname",
// 	EmployeeId = "employeeid",
// 	Active = "active",
// 	Classification = "classification",
// 	ManagerId = "managerid",
// 	Password = "password",
// 	CreatedOn = "createdon"
// }
// /********************************/
// export enum ActiveUserFieldName {
// 	ID = "id",
// 	EmployeeId = "employeeid",
// 	Name = "name",
// 	Classification = "classification",
// 	SessionKey = "sessionkey",
// 	CreatedOn = "createdon"

export enum EmployeeFieldName {
	ID = "id",
	Active = "active",
	Password = "password",
	LastName = "lastname",
	CreatedOn = "createdon",
	FirstName = "firstname",
	ManagerId = "managerid",
	EmployeeId = "employeeid",
	Classification = "classification"
}

export enum ActiveUserFieldName {
	ID = "id",
	Name = "name",
	CreatedOn = "createdon",
	EmployeeId = "employeeid",
	SessionKey = "sessionkey",
	Classification = "classification"
}
