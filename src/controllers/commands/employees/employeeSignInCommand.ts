import Sequelize from "sequelize";
import * as Helper from "../helpers/helper";
import { EmployeeModel } from "../models/employeeModel";
import * as EmployeeHelper from "./helpers/employeeHelper";
import { ActiveUserModel } from "../models/activeUserModel";
import * as EmployeeRepository from "../models/employeeModel";
import { Resources, ResourceKey } from "../../../resourceLookup";
import * as ActiveUserRepository from "../models/activeUserModel";
import * as DatabaseConnection from "../models/databaseConnection";
import { CommandResponse, SignInRequest, ActiveUser } from "../../typeDefinitions";

// Validate active user sign in request by verifying employeeId and password are not blank
const validateSaveRequest = (signInRequest: SignInRequest): CommandResponse<ActiveUser> => {
	if (Helper.isBlankString(signInRequest.employeeId) // if blank
		|| isNaN(Number(signInRequest.employeeId))
		|| Helper.isBlankString(signInRequest.password)) {

		return <CommandResponse<ActiveUser>>{ // Return invalid credentials message
			status: 422, // unprocessable_entity
			message: Resources.getString(ResourceKey.USER_SIGN_IN_CREDENTIALS_INVALID)
		};
	}

	return <CommandResponse<ActiveUser>>{ status: 200 }; // return accepted
};
// Sets upsertActiveUser to be a potential active user
const upsertActiveUser = async (
	activeUser: ActiveUserModel
): Promise<CommandResponse<ActiveUserModel>> => {

	let upsertTransaction: Sequelize.Transaction; // Creation of new transaction

	return DatabaseConnection.createTransaction() // New transaction for database
		.then((createdTransaction: Sequelize.Transaction): Promise<ActiveUserModel | null> => {
			upsertTransaction = createdTransaction;

			return ActiveUserRepository.queryByEmployeeId( // Return active user ID
				activeUser.employeeId,
				upsertTransaction);
		}).then((queriedActiveUser: (ActiveUserModel | null)): Promise<ActiveUserModel> => {
			if (queriedActiveUser) { // If queriedActiveUser equals existing ID
				return queriedActiveUser.update( // Then update the activeUser
					<Object>{ sessionKey: activeUser.sessionKey }, // Update sessionKey
					<Sequelize.InstanceUpdateOptions>{
						transaction: upsertTransaction // Update transaction
					});
			} else { // Else create new active user record in the database and populate it with user info
				return ActiveUserModel.create(
					activeUser,
					<Sequelize.CreateOptions>{
						transaction: upsertTransaction
					});
			}
		}).then((activeUser: ActiveUserModel): CommandResponse<ActiveUserModel> => {
			upsertTransaction.commit(); // Commit transaction

			return <CommandResponse<ActiveUserModel>>{
				status: 200, // status ok
				data: activeUser
			};
		}).catch((error: any): Promise<CommandResponse<ActiveUserModel>> => {
			upsertTransaction.rollback(); // If any error encountered with the promise terminate transaction

			return Promise.reject(<CommandResponse<ActiveUserModel>>{ // Error was encountered
				status: 500, // internal server error
				message: error.message
			});
		});
};
// Execution of sign on validation
export const execute = async (
	signInRequest: SignInRequest,
	session?: Express.Session
): Promise<CommandResponse<ActiveUser>> => {

	if (session == null) {
		return Promise.reject(<CommandResponse<ActiveUser>>{ // Error with promise
			status: 500, // internal server error
			message: Resources.getString(ResourceKey.USER_SESSION_NOT_FOUND)
		});
	}
//  Saves validationResponse as a result of the save request
	const validationResponse: CommandResponse<ActiveUser> =
		validateSaveRequest(signInRequest); // Checks to see if signInRequest is blank
	if (validationResponse.status !== 200) { //  If status does not equal ok
		return Promise.reject(validationResponse); // Error with the validationResponse likely signInRequest was blank
	}
//  Return active user after checking if it is equal to null or if password matches then sets all active users data
	return EmployeeRepository.queryByEmployeeId(Number(signInRequest.employeeId))
		.then((queriedEmployee: (EmployeeModel | null)): Promise<CommandResponse<ActiveUserModel>> => {
			if ((queriedEmployee == null) ||
				(EmployeeHelper.hashString(signInRequest.password) !== queriedEmployee.password.toString())) {

				return Promise.reject(<CommandResponse<ActiveUser>>{ // Either the model equaled null or invalid password
					status: 401, // Unauthorized status
					message: Resources.getString(ResourceKey.USER_SIGN_IN_CREDENTIALS_INVALID)
				});
			}

			return upsertActiveUser(<ActiveUserModel>{ // Return user credentials
				employeeId: queriedEmployee.id, // Set employee id
				sessionKey: (<Express.Session>session).id, // Set session Key
				classification: queriedEmployee.classification, // Set classification
				name: (queriedEmployee.firstName + " " + queriedEmployee.lastName) // Set name
			});
		}).then((activeUserCommandResponse: CommandResponse<ActiveUserModel>): CommandResponse<ActiveUser> => {
			return <CommandResponse<ActiveUser>>{ // Return user credentials user has been validated
				status: 200, // status ok
				data: <ActiveUser>{ // User data
					id: (<ActiveUserModel>activeUserCommandResponse.data).id,
					name: (<ActiveUserModel>activeUserCommandResponse.data).name,
					employeeId: (<ActiveUserModel>activeUserCommandResponse.data).employeeId,
					classification: (<ActiveUserModel>activeUserCommandResponse.data).classification
				}
			};
		});
};
