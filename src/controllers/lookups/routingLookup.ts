export enum ParameterLookup {
	ProductId = "productId",
	EmployeeId = "employeeId"
}

export enum QueryParameterLookup {
	ErrorCode = "errorCode",
	EmployeeId = "employeeId"
}

export enum ViewNameLookup {
	SignIn = "signIn",
	MainMenu = "mainMenu",
	ProductDetail = "productDetail",
	EmployeeDetail = "employeeDetail",
	ProductListing = "productListing"
}

export enum RouteLookup {
	// Page routing
	SignIn = "/",
	SignOut = "/signOut",
	MainMenu = "/mainMenu",
	ProductDetail = "/productDetail",
	EmployeeDetail = "/employeeDetail",
	ProductListing = "/productListing",

	// Page routing - parameters
	ProductIdParameter = "/:productId",
	EmployeeIdParameter = "/:employeeId",
	// End page routing - parameters
	// End page routing

	// API routing
	API = "/api",
	// End API routing
}
