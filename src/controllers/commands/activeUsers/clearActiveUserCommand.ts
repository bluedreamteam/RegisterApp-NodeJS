import Sequelize from "sequelize";
import { CommandResponse } from "../../typeDefinitions";
import { ActiveUserModel } from "../models/activeUserModel";
import { Resources, ResourceKey } from "../../../resourceLookup";
import * as ActiveUserRepository from "../models/activeUserModel";
import * as DatabaseConnection from "../models/databaseConnection";

const attemptRemoveActiveUser = async (
	lookupData: string,
	activeUserQuery: (
		lookupData: string,
		queryTransaction?: Sequelize.Transaction
	) => Promise<ActiveUserModel | null>
): Promise<CommandResponse<void>> => {

	let removeTransaction: Sequelize.Transaction;

	return DatabaseConnection.createTransaction()
		.then((createdTransaction: Sequelize.Transaction): Promise<ActiveUserModel | null> => {
			removeTransaction = createdTransaction;

			return activeUserQuery(lookupData, removeTransaction);
		}).then((queriedActiveUser: (ActiveUserModel | null)): Promise<void> => {
			if (!queriedActiveUser) {
				return Promise.resolve();
			}

			return queriedActiveUser.destroy(
				<Sequelize.DestroyOptions>{
					transaction: removeTransaction
				});
		}).then((): CommandResponse<void> => {
			removeTransaction.commit();

			return <CommandResponse<void>>{ status: 204 };
		}).catch((error: any): CommandResponse<void> => {
			if (removeTransaction != null) {
				removeTransaction.rollback();
			}

			return <CommandResponse<void>>{
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
			status: 422,
			message: Resources.getString(ResourceKey.USER_UNABLE_TO_SIGN_OUT)
		};
	}

	return attemptRemoveActiveUser(activeUserId, ActiveUserRepository.queryById);
};

export const removeBySessionKey = async (
	sessionKey: string
): Promise<CommandResponse<void>> => {

	return attemptRemoveActiveUser(sessionKey, ActiveUserRepository.queryBySessionKey);
};
