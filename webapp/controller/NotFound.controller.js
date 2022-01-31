sap.ui.define([
		"zjblesso02/EmptyApplication/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("zjblesso02.EmptyApplication.controller.NotFound", {

			/**
			 * Navigates to the worklist when the link is pressed
			 * @public
			 */
			onLinkPressed : function () {
				this.getRouter().navTo("worklist");
			}

		});

	}
);