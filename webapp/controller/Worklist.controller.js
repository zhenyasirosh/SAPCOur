/*global location history */
sap.ui.define([
	"zjblesso02/EmptyApplication/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"zjblesso02/EmptyApplication/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/m/Dialog"
], function(BaseController, JSONModel, History, formatter, Filter, FilterOperator, MessageBox, MessageToast, Dialog) {
	"use strict";

	var sResponsivePaddingClasses = "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer";

	return BaseController.extend("zjblesso02.EmptyApplication.controller.Worklist", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function() {
			var oViewModel,
				iOriginalBusyDelay,
				oTable = this.byId("table");

			// Put down worklist table's original value for busy indicator delay,
			// so it can be restored later on. Busy handling on the table is
			// taken care of by the table itself.
			// iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
			// keeps the search state
			this._aTableSearchState = [];

			// Model used to manipulate control states
			oViewModel = new JSONModel({
				worklistTableTitle: this.getResourceBundle().getText("worklistTableTitle"),
				saveAsTileTitle: this.getResourceBundle().getText("saveAsTileTitle", this.getResourceBundle().getText("worklistViewTitle")),
				shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
				shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
				shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
				tableNoDataText: this.getResourceBundle().getText("tableNoDataText"),
				tableBusyDelay: 0
			});
			this.setModel(oViewModel, "worklistView");

			// Make sure, busy indication is showing immediately so there is no
			// break after the busy indication for loading the view's meta data is
			// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
			// oTable.attachEventOnce("updateFinished", function(){
			// 	// Restore original busy indicator delay for worklist's table
			// 	oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
			// });
			// Add the worklist page to the flp routing history
			this.addHistoryEntry({
				title: this.getResourceBundle().getText("worklistViewTitle"),
				icon: "sap-icon://table-view",
				intent: "#EmptyApplicationTitle-display"
			}, true);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Triggered by the table's 'updateFinished' event: after new table
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished: function(oEvent) {
			// update the worklist's object counter after the table update
			var sTitle,
				oTable = oEvent.getSource(),
				iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
			} else {
				sTitle = this.getResourceBundle().getText("worklistTableTitle");
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
		},

		onPressNavToDetail: function() {
			this.getSplitAppObj().to(this.createId("detailDetail"));
		},

		onPressDetailBack: function() {
			this.getSplitAppObj().backDetail();
		},

		onPressCalendarFullScreen: function() {
			var hope = this.byId("text1");
			hope.to(this.byId("page2"), "slide");
		},

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPress: function(oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
		},

		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onShareInJamPress: function() {
			var oViewModel = this.getModel("worklistView"),
				oShareDialog = sap.ui.getCore().createComponent({
					name: "sap.collaboration.components.fiori.sharing.dialog",
					settings: {
						object: {
							id: location.href,
							share: oViewModel.getProperty("/shareOnJamTitle")
						}
					}
				});
			oShareDialog.open();
		},

		onSearch: function(oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
			} else {
				var aTableSearchState = [];
				var sQuery = oEvent.getParameter("query");

				if (sQuery && sQuery.length > 0) {
					aTableSearchState = [new Filter("ID", FilterOperator.Contains, sQuery)];
				}
				this._applySearch(aTableSearchState);
			}

		},

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh: function() {
			var oTable = this.byId("table");
			oTable.getBinding("items").refresh();
		},

		onInitialFocusOnCustomAction: function() {

			// MessageBox.show(
			// 	'Выберите действие', {
			// 		icon: MessageBox.Icon.INFORMATION,
			// 		title: "Выбор действия",
			// 		contentWidth: "400px",
			// 		actions: ["Поиск персонала", "Загрузка персонала", sap.m.MessageBox.Action.CANCEL],
			// 		emphasizedAction: sResponsivePaddingClasses,
			// 		styleClass: "Поиск персонала" ? "sapUiSizeCompact" : "",  
			// 		onClose: function(sAction) {
			// 			if (sAction === "Поиск персонала") {
			// 				this.onRefresh();
			// 			} else if (sAction === "Загрузка персонала") {
			// 				MessageToast.show("Action selected: " + sAction);
			// 			} else if (sAction === "Отмена") {
			// 				console.log(sAction);
			// 				MessageToast.show("Action selected:dsds " + sAction);
			// 			}

			// 		}.bind(this)
			// 	}

			// );
			// MessageBox.information(
			// 	'Initial button focus is set by attribute \n initialFocus: \"Custom button\" \n Note: The name is not case sensitive',
			// 	{
			// 		icon: MessageBox.Icon.WARNING,
			// 		title: "Focus on a Custom Action",
			// 		actions: [MessageBox.Action.YES, MessageBox.Action.NO, "Custom Action"],
			// 		emphasizedAction: "Custom Action",
			// 		initialFocus: "Custom Action",
			// 		styleClass: sResponsivePaddingClasses
			// 	}
			// );

			// if (!this.oCandidateDialog) {
			// 	this.oCandidateDialog = new Dialog({
			// 		type: sap.m.DialogType.Message,
			// 		// state: sap.m.ValueState.Information,
			// 		title: "Выбор действия",
			// 		horizontalScrolling: false,
			// 		icon: "sap-icon://message-information",
			// 		titleAlignment: "Center",
			// 		contentWidth: "363px",
			// 		content: new sap.m.Text({
			// 			width: "363px",
			// 			textAlign: "Center",
			// 			text: "Выберите действие"
			// 		}),
			// 		buttons: [
			// 			new sap.m.Button({
			// 				text: "Поиск кандидата",
			// 				type: sap.m.ButtonType.Accept,
			// 				press: function() {
			// 					this.oCandidateDialog.close();
			// 					MessageToast.show("dsfsdf");
			// 				}.bind(this)
			// 			}),
			// 			new sap.m.Button({
			// 				text: "Загрузка кандидата",
			// 				type: sap.m.ButtonType.Emphasized,
			// 				press: function() {
			// 					this.oCandidateDialog.close();
			// 					MessageToast.show("dsfsdf");
			// 				}.bind(this)
			// 			}),
			// 			new sap.m.Button({
			// 				text: "Отмена",
			// 				type: sap.m.ButtonType.None,
			// 				press: function() {
			// 					this.oCandidateDialog.close();
			// 				}.bind(this)
			// 			})
			// 		]
			// 	}).addStyleClass("sapMMessageBox");

			// 	//to get access to the controller's model
			// 	this.getView().addDependent(this.oCandidateDialog);
			// }

			// this.oCandidateDialog.open();

			var oView = this.getView();
			if (!this.aDialog) {
				this.aDialog = sap.ui.xmlfragment("zjblesso02.EmptyApplication.view.Test", this);
				this.aDialog.setModel(this.getView().getModel());
				this.getView().addDependent(this.aDialog);
			}
			// this.aDialog._mainPage = sap.m.Fragment.byId("CreateEdit", "mainPage");
			// if (this.aDialog._mainPage !== undefined) {
			// 		this.aDialog._mainPage.unbindElement();
			// 	    if (oItem !== undefined && oItem.sPath !== undefined) {
   // 				    aDialog._mainPage.bindElement(oItem.sPath);
			// 	    // sap.ui.core.Fragment.byId(oxmlfragmentName, "mainPage").bindElement(oItem.sPath);
			// 	    }
   //             }
				this.aDialog.open();
			

			// this._pParticipantsPopover = sap.ui.require(["sap/ui/core/Fragment"], function(Fragment) {
			// 	Fragment.load({
			// 		id: oView.getId(),
			// 		name: "zjblesso02.EmptyApplication.view.Test",
			// 		controller: this
			// 	}).then(function(oParticipantsPopover) {
			// 		oView.addDependent(oParticipantsPopover);
			// 		return oParticipantsPopover;
			// 	});

			// });
			// this._pParticipantsPopover.then(function(oParticipantsPopover) {
			// 	oParticipantsPopover.open();
			// });

			// if (!this.oCandidateDialog) {
			// 	this._pParticipantsPopover = Fragment.load({
			// 		name: "zjblesso02.EmptyApplication.view.Test",
			// 		controller: this
			// 	this.oCandidateDialog = new Dialog({
			// 		type: sap.m.DialogType.Message,
			// 		// state: sap.m.ValueState.Information,
			// 		title: "Выбор действия",
			// 		icon: "sap-icon://message-information",
			// 		titleAlignment: "Center",
			// 		content: "zjblesso02.EmptyApplication.webapp.view.Test"
			// 	}).addStyleClass("sapMMessageBox");

			// 	//to get access to the controller's model
			// 	this.getView().addDependent(this.oCandidateDialog);
			// }

			// this.oCandidateDialog.open();

			// this.oCalendarDialog = new sap.m.Dialog({

			// 		verticalScrolling: true,
			// 		showHeader: false,
			// 		horizontalScrolling: true,
			// 		titleAlignment: "Center",
			// 		beforeClose: [this.deactivateCalendarFullScreen, this],
			// 		content: calendar
			// 	}).addStyleClass("sapUiSizeCompact");

		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject: function(oItem) {
			this.getRouter().navTo("object", {
				objectId: oItem.getBindingContext().getProperty("ID")
			});
		},

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
		 * @private
		 */
		_applySearch: function(aTableSearchState) {
			var oTable = this.byId("table"),
				oViewModel = this.getModel("worklistView");
			oTable.getBinding("items").filter(aTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
		}

	});
});