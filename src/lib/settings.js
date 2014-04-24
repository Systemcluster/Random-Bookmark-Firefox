/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. 
 */

/* extension: Random Bookmark 
 * version: 2.0
 * created at: 2012-12-28
 * author: Christian Sdunek
 */

"use strict";

let prefs = Services.prefs;
let branch = null;
let bdefault = null;

let branchstring = "";

function setBranch(newBranch) {
	branchstring = newBranch;
	branch = prefs.getBranch(newBranch+".");
	bdefault = prefs.getDefaultBranch(newBranch+".");
}
exports.setBranch = setBranch;

function readDefaultSettings(){
	let tempDefault = {
		filters: "",
		filters_enabled: true,
		type: "bookmark",
		buttonstyle: "bookmark"
	};
	setDefault("filters", tempDefault.filters, getTypeTo("string"));
	setDefault("filters_enabled", tempDefault.filters_enabled, getTypeTo("bool"));
	setDefault("type", tempDefault.type, getTypeTo("string"));
	setDefault("buttonstyle", tempDefault.buttonstyle, getTypeTo("string"));
}

exports.getSetting = function getSetting(setting) {
	let type = branch.getPrefType(setting);
	if(type == branch.PREF_INVALID) {
		readDefaultSettings();
		type = branch.getPrefType(setting);
		if(type == branch.PREF_INVALID) {
			return null;
		}
	}
	if(type == branch.PREF_STRING) {
		return branch.getCharPref(setting);
	}
	if(type == branch.PREF_BOOL) {
		return branch.getBoolPref(setting);
	}
	if(type == branch.PREF_INT) {
		return branch.getBoolPref(setting);
	}
};

function setSetting(setting, value, type) {
	if(!type) {
		type = branch.getPrefType(setting);
	}
	if(type == branch.PREF_INVALID) {
		return null;
	}
	if(type == branch.PREF_STRING) {
		return branch.setCharPref(setting, value);
	}
	if(type == branch.PREF_BOOL) {
		return branch.setBoolPref(setting, value);
	}
	if(type == branch.PREF_INT) {
		return branch.setBoolPref(setting, value);
	}	
}
exports.setSetting = setSetting;

function setDefault(setting, value, type) {
	if(!type) {
		type = bdefault.getPrefType(setting);
	}
	if(type == bdefault.PREF_INVALID) {
		return null;
	}
	if(type == bdefault.PREF_STRING) {
		return bdefault.setCharPref(setting, value);
	}
	if(type == bdefault.PREF_BOOL) {
		return bdefault.setBoolPref(setting, value);
	}
	if(type == bdefault.PREF_INT) {
		return bdefault.setBoolPref(setting, value);
	}	
}
exports.setDefault = setDefault;

// import legacy pref branch in Gecko < 13
if (Services.vc.compare(Services.appinfo.platformVersion, "13.0") < 0) {
	branch.QueryInterface(Components.interfaces.nsIPrefBranch2);	
}

function addObserver(pref, observer) {	
	if(!branch) {
		readDefaultSettings();
		branch = prefs.getBranch(branchstring+".");
	}
	branch.addObserver(pref, observer, false);
	registerShutdownCallback(function() {
		branch.removeObserver(pref, observer);
	});
}
exports.addObserver = addObserver;

function getTypeTo(type) {
	if(type=="string")
		return branch.PREF_STRING;
	if(type=="bool")
		return branch.PREF_BOOL;
	if(type=="int")
		return branch.PREF_INT;
	return null;
}
exports.getTypeTo = getTypeTo;
