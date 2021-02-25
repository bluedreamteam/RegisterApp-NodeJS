export enum ParameterLookup {
	ProductId = "productId"
}

export enum QueryParameterLookup {
	ErrorCode = "errorCode"
}

export enum ViewNameLookup {
	ProductDetail = "productDetail",
	ProductListing = "productListing",
	MainMenu = "mainMenu",
}

export enum RouteLookup {
	// Page routing
	ProductListing = "/",
	ProductDetail = "/productDetail",
	MainMenu = "/mainMenu",
	// ProductListing = "/productListing",

	// Page routing - parameters
	ProductIdParameter = "/:productId",
	// End page routing - parameters
	// End page routing

	// API routing
	API = "/api",
	// End API routing
}
