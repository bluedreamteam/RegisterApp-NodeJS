import { ActiveUserModel } from "../models/activeUserModel";
import { Resources, ResourceKey } from "../../../resourceLookup";
import * as ActiveUserRepository from "../models/activeUserModel";
import { CommandResponse, ActiveUser } from "../../typeDefinitions";

export const execute = async (sessionKey: string): Promise<CommandResponse<ActiveUser>> => {
	return ActiveUserRepository.queryBySessionKey(sessionKey)
		.then((queriedActiveUser: (ActiveUserModel | null)): Promise<CommandResponse<ActiveUser>> => {
			if (!queriedActiveUser) {
				return Promise.reject(<CommandResponse<ActiveUser>>{
					status: 404,
					message: Resources.getString(ResourceKey.USER_NOT_FOUND)
				});
			}

			return Promise.resolve(<CommandResponse<ActiveUser>>{
				status: 200,
				data: queriedActiveUser
			});
	});
};
