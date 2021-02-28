import { Request, Response } from "express";
import { Resources, ResourceKey } from "../resourceLookup";
import * as EmployeeSignIn from "./commands/employees/employeeSignInCommand";
import * as ClearActiveUser from "./commands/activeUsers/clearActiveUserCommand";
import * as EmployeeExistsQuery from "./commands/employees/activeEmployeeExistsQuery";
import { PageResponse, CommandResponse, ApiResponse, SignInPageResponse } from "./typeDefinitions";
import { ViewNameLookup, RouteLookup, QueryParameterLookup, ParameterLookup } from "./lookups/routingLookup";

export const start = async (req: Request, res: Response): Promise<void> => {
	return EmployeeExistsQuery.query()
		.then((employeeExistsCommandResponse: CommandResponse<boolean>): void => {
			if ((employeeExistsCommandResponse.data == null)
				|| !employeeExistsCommandResponse.data) {

				return res.redirect(ViewNameLookup.EmployeeDetail);
			}

			return res.render(
				ViewNameLookup.SignIn,
				<SignInPageResponse>{
					employeeId: req.query[ParameterLookup.EmployeeId],
					errorMessage: Resources.getString(
						req.query[QueryParameterLookup.ErrorCode])
				});
		}).catch((error: any): void => {
			return res.render(
				ViewNameLookup.SignIn,
				<PageResponse>{
					errorMessage: (error.message
						|| Resources.getString(
							ResourceKey.EMPLOYEES_UNABLE_TO_QUERY))
				});
		});
};

export const signIn = async (req: Request, res: Response): Promise<void> => {
	return EmployeeSignIn.execute(req.body, req.session)
		.then((): void => {
			return res.redirect(RouteLookup.MainMenu);
		}).catch((error: any): void => {
			console.error(
				"An error occurred when attempting to perform employee sign in. "
				+ error.message);

			return res.redirect(RouteLookup.SignIn
				+ "?" + QueryParameterLookup.ErrorCode
				+ "=" + ResourceKey.USER_UNABLE_TO_SIGN_IN);
		});
};

export const clearActiveUser = async (req: Request, res: Response): Promise<void> => {
	if (req.session == null) {
		res.status(204)
			.send(<ApiResponse>{ redirectUrl: RouteLookup.SignIn });

		return;
	}

	return ClearActiveUser.removeBySessionKey((<Express.Session>req.session).id)
		.then((removeCommandResponse: CommandResponse<void>): void => {
			res.status(removeCommandResponse.status)
				.send(<ApiResponse>{ redirectUrl: RouteLookup.SignIn });
		}).catch((error: any): void => {
			res.status(error.status || 500)
				.send(<ApiResponse>{
					errorMessage: error.message,
					redirectUrl: RouteLookup.SignIn
				});
		});
};
