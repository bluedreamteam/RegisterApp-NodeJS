import express from "express";
import { RouteLookup } from "../controllers/lookups/routingLookup";
import * as SignInRouteController from "../controllers/signInRouteController";

function signInRoutes(server: express.Express) {
	server.get(RouteLookup.SignIn, SignInRouteController.start);

	server.post(RouteLookup.SignIn, SignInRouteController.signIn);

	server.delete(
		(RouteLookup.API + RouteLookup.SignOut),
		SignInRouteController.clearActiveUser);
}

module.exports.routes = signInRoutes;
