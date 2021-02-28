import { Request, Response } from "express";
import { ViewNameLookup } from "./lookups/routingLookup";
import * as Helper from "./helpers/routeControllerHelper";
import { Resources, ResourceKey } from "../resourceLookup";
import * as ProductsQuery from "./commands/products/productsQuery";
import * as EmployeeHelper from "./commands/employees/helpers/employeeHelper";
import * as ValidateActiveUser from "./commands/activeUsers/validateActiveUserCommand";
import { CommandResponse, Product, ProductListingPageResponse, ActiveUser } from "./typeDefinitions";

const processStartProductListingError = (error: any, res: Response): void => {
	if (Helper.processStartError(error, res)) {
		return;
	}

	res.setHeader(
		"Cache-Control",
		"no-cache, max-age=0, must-revalidate, no-store");

	return res.status((error.status || 500))
		.render(
			ViewNameLookup.ProductListing,
			<ProductListingPageResponse>{
				products: [],
				isElevatedUser: false,
				errorMessage: (error.message
					|| Resources.getString(ResourceKey.PRODUCTS_UNABLE_TO_QUERY))
			});
};

export const start = async (req: Request, res: Response): Promise<void> => {
	if (Helper.handleInvalidSession(req, res)) {
		return;
	}

	let isElevatedUser: boolean;

	return ValidateActiveUser.execute((<Express.Session>req.session).id)
		.then((activeUserCommandResponse: CommandResponse<ActiveUser>): Promise<CommandResponse<Product[]>> => {
			isElevatedUser =
				EmployeeHelper.isElevatedUser(
					(<ActiveUser>activeUserCommandResponse.data).classification);

			return ProductsQuery.query();
		}).then((productsCommandResponse: CommandResponse<Product[]>): void => {
			res.setHeader(
				"Cache-Control",
				"no-cache, max-age=0, must-revalidate, no-store");

			return res.render(
				ViewNameLookup.ProductListing,
				<ProductListingPageResponse>{
					isElevatedUser: isElevatedUser,
					products: productsCommandResponse.data
				});
		}).catch((error: any): void => {
			return processStartProductListingError(error, res);
		});
};
