/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"zjblesso02/EmptyApplication/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"zjblesso02/EmptyApplication/test/integration/pages/Worklist",
	"zjblesso02/EmptyApplication/test/integration/pages/Object",
	"zjblesso02/EmptyApplication/test/integration/pages/NotFound",
	"zjblesso02/EmptyApplication/test/integration/pages/Browser",
	"zjblesso02/EmptyApplication/test/integration/pages/App"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "zjblesso02.EmptyApplication.view."
	});

	sap.ui.require([
		"zjblesso02/EmptyApplication/test/integration/WorklistJourney",
		"zjblesso02/EmptyApplication/test/integration/ObjectJourney",
		"zjblesso02/EmptyApplication/test/integration/NavigationJourney",
		"zjblesso02/EmptyApplication/test/integration/NotFoundJourney",
		"zjblesso02/EmptyApplication/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});