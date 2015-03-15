/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* extension: Random Bookmark 
 * version: 2.5.0
 * created at: 2012-12-28 (begin of development)
 * author: Christian Sdunek
 */

"use strict";

let randomBookmark = require("randomBookmark");
let randomHistory = require("randomHistory");
let randomCombined = require("randomCombined");
let settings = require("settings");
let toolbarButton = require("toolbarButton");
let l10n 	= require("l10n");

// ----------------------------------
function getFilters() {
	if(settings.getSetting("filters_enabled")===false){
		return;
	}
	let filter = new Array();
	let filterstring = settings.getSetting("filters");
	if(filterstring.length>0) {
		let parse = JSON.parse(filterstring);
		if(parse) {
			for(let i = 0; i < parse.length; ++i) {
				if(parse[i][1] === true)
					filter.push(parse[i][0]);
			}
		}
	}
	return (filter.length>0?filter:null);
}

// ----------------------------------
function getURI() {
	let uri;
	let type = settings.getSetting("type");
	if(type=="bookmark") { 
		uri = randomBookmark.getRandomURL(getFilters(), settings.getSetting("source"), settings.getSetting("normalized"));
		if(!uri) Services.prompt.alert(null, "Random Bookmark", l10n.getLocalized("message.nobookmark"));
	}
	else if(type=="history") {
		uri = randomHistory.getRandomURL(getFilters(), settings.getSetting("normalized"));
		if(!uri) Services.prompt.alert(null, "Random Bookmark", l10n.getLocalized("message.nohistory"));
	}
	else if(type=="combined") {
		uri = randomCombined.getRandomURL(getFilters(), settings.getSetting("source"), settings.getSetting("normalized"));
		if(!uri) Services.prompt.alert(null, "Random Bookmark", l10n.getLocalized("message.nocombined"));
	}
	return uri;
}

// ----------------------------------
function onButtonCommand(evt) {
	let uri = getURI();
	if(uri) {
		let window = Services.wm.getMostRecentWindow("navigator:browser");
		window.gBrowser.loadURI(uri);
	}
}

// ----------------------------------
function onButtonClick(evt) {
	/* left click
	 * do not use onClick to process a normal button command, use onCommand instead
	 * onClick fires on every point of the button, even the menu */
	if(evt.button === 0) {   
	}
	/* middle click */
	if(evt.button === 1) {
		evt.preventDefault();

		let uri = getURI();
		if(uri) {
			let window = Services.wm.getMostRecentWindow("navigator:browser");
			window.gBrowser.selectedTab = window.gBrowser.addTab(uri);
		}
	}
	/* right click */
	if(evt.button === 2) {
	}
}

function openSettingsDialog() {

	let window = Services.wm.getMostRecentWindow("navigator:browser");
	/*let dialog = Services.ww.openWindow(window, "chrome://random-bookmark/content/settingsDialog.xul",
		"RandomBookmark", "chrome,centerscreen,dialog,dependant", null);
	*/
	let dialog = window.openDialog("chrome://random-bookmark/content/settingsDialog.xul", "RandomBookmark", "chrome,toolbar,centerscreen,dependant,modal");

} exports.openSettingsDialog = openSettingsDialog;

// ----------------------------------
function createMenu() {
	var menu = {
		id: "rb.menu-main",
		position: 'after_start',
		items: [{
				id: 'rb.menu-main.entry-bookmark',
				type: 'radio',
				name: 'random.type',
				label: l10n.getLocalized("button.menu.bookmark"),
				tooltiptext: l10n.getLocalized("button.menu.bookmark.tooltip"),
				onCommand: function(evt){
					settings.setSetting("type", "bookmark");
				}
			},{
				id: 'rb.menu-main.entry-history',
				type: 'radio',
				name: 'random.type',
				label: l10n.getLocalized("button.menu.history"),
				tooltiptext: l10n.getLocalized("button.menu.history.tooltip"),
				onCommand: function(evt){
					settings.setSetting("type", "history");
				}
			},{
				id: 'rb.menu-main.entry-combined',
				type: 'radio',
				name: 'random.type',
				label: l10n.getLocalized("button.menu.combined"),
				tooltiptext: l10n.getLocalized("button.menu.combined.tooltip"),
				onCommand: function(evt){
					settings.setSetting("type", "combined");
				}
			},
			null,
			{
				id: 'rb.menu-main.entry-filtering',
				type: 'checkbox',
				name: 'filters.enabled',
				label: l10n.getLocalized("button.menu.filters.enabled"),
				tooltiptext: l10n.getLocalized("button.menu.filters.enabled.tooltip"),
				checked: settings.getSetting("filters_enabled")===true?true:false,
				onCommand: function(evt){
					if(settings.getSetting("filters_enabled") === true)
						settings.setSetting("filters_enabled", false);
					else
						settings.setSetting("filters_enabled", true);
				}
			},
			null,
			{
				id: 'rb.menu-main.entry-4',
				label: l10n.getLocalized("button.menu.settings"),
				tooltiptext: l10n.getLocalized("button.menu.settings.tooltip"),
				onCommand: function(evt){
					openSettingsDialog();
				}
			}]
	};
	return menu;
}

// ----------------------------------
function getCustomizedImage(){
	let style = settings.getSetting("buttonstyle");
	let type = settings.getSetting("type");
	let image = "chrome://random-bookmark/skin/icon16-"+style+"-"+type+".png";
	return image;
}
exports.getCustomizedImage = getCustomizedImage;

// ----------------------------------
exports.main = function main () {

	settings.setBranch("extensions.random-bookmark");

	let typeObserver = {
		observe:function() {
			toolbarButton.updateAttribute("rb.button-main", "image", getCustomizedImage());
			toolbarButton.updateAttribute("rb.menu-main.entry-"+settings.getSetting("type"), "checked", true);
		}
	};
	settings.addObserver("type", typeObserver);

	let buttonstyleObserver = {
		observe:function() {
			toolbarButton.updateAttribute("rb.button-main", "image", getCustomizedImage());
		}
	};
	settings.addObserver("buttonstyle", buttonstyleObserver);

	let filterEnabledObserver = {
		observe:function() {
			toolbarButton.updateAttribute("rb.menu-main.entry-filtering", "checked", settings.getSetting("filters_enabled"));
		}
	};
	settings.addObserver("filters_enabled", filterEnabledObserver);

	let button = toolbarButton.createButton({
		id: "rb.button-main",
		image: getCustomizedImage(),
		label: "Random Bookmark", 
		menu: createMenu(),
		toolbar: "nav-bar",
		update: function() {
			this.image = getCustomizedImage();
		},

		onCommand: onButtonCommand,
		onClick: onButtonClick
	});

	toolbarButton.updateAttribute("rb.menu-main.entry-"+settings.getSetting("type"), "checked", true);
};
