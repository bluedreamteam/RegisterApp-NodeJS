import Sequelize from "sequelize";
import { CommandResponse } from "../../typeDefinitions";
import { ActiveUserModel } from "../models/activeUserModel";
import { Resources, ResourceKey } from "../../../resourceLookup";
import * as ActiveUserRepository from "../models/activeUserModel";
import * as DatabaseConnection from "../models/databaseConnection";

// Attempts to remove an active user by data associated with
// the employee database provided by the user through the variable lookupData
const attemptRemoveActiveUser = async (
	lookupData: string, // either ID or session key
	activeUserQuery: (
		lookupData: string,
		queryTransaction?: Sequelize.Transaction
	) => Promise<ActiveUserModel | null>
): Promise<CommandResponse<void>> => {

	let removeTransaction: Sequelize.Transaction;

	return DatabaseConnection.createTransaction() // Check against database.
		.then((createdTransaction: Sequelize.Transaction): Promise<ActiveUserModel | null> => {
			removeTransaction = createdTransaction;

			return activeUserQuery(lookupData, removeTransaction); // Return user by lookupData and transaction
		}).then((queriedActiveUser: (ActiveUserModel | null)): Promise<void> => {
			if (!queriedActiveUser) { // If queriedActiveUser does not equal null
				return Promise.resolve(); // resolve Promise value
			}

			return queriedActiveUser.destroy( // Actually remove searched user
				<Sequelize.DestroyOptions>{
					transaction: removeTransaction
				});
		}).then((): CommandResponse<void> => { // End current transaction
			removeTransaction.commit();

			return <CommandResponse<void>>{ status: 204 }; // return no content
		}).catch((error: any): CommandResponse<void> => {
			if (removeTransaction != null) {
				removeTransaction.rollback();
			}

			return <CommandResponse<void>>{ // return internal server error
				status: 500,
				message: error.message
			};
		});
};

// Attempt to remove an active user by their ID
export const removeById = async (
	activeUserId?: string
): Promise<CommandResponse<void>> => {

	if ((activeUserId == null) || (activeUserId.trim() === "")) {
		return <CommandResponse<void>>{
			status: 422, // unprocessable_entity
			message: Resources.getString(ResourceKey.USER_UNABLE_TO_SIGN_OUT)
		};
	}
//  Removal of active user calling on main removal function.
	return attemptRemoveActiveUser(activeUserId, ActiveUserRepository.queryById);
};

// Attempt to remove an active user by their Session Key
export const removeBySessionKey = async (
	sessionKey: string
): Promise<CommandResponse<void>> => {
//  Calls main removal function by looking up session key
	return attemptRemoveActiveUser(sessionKey, ActiveUserRepository.queryBySessionKey);
};