/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. 
 */

/* by using this source code for your own projects,
 * be sure to give proper credit to the original author.
 */

/* extension: Random Bookmark 
 * version: 2.1.1
 * created at: 2012-12-28
 * author: Christian Sdunek
 *
 * notes: 
 *  requires some methods and vars from the specific bootstrap
 */

"use strict";

const NS_XUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

let setupReason = startupReason;

/**
 * @return
 * the toolbar in which currentset the button exists
 */
function getButtonToolbar(id, document) {
	let toolbars = document.getElementsByTagNameNS(NS_XUL, "toolbar");
	for(let i = 0; i < toolbars.length; ++i) {
		/* regex check */
		//if((new RegExp("(?:^|,)" + id + "(?:,|$)")).test(toolbars[i].getAttribute("currentset")))
		/* manual check */
		let currentset = toolbars[i].getAttribute("currentset").split(",");
		if(currentset.indexOf(id) > -1)
			return toolbars[i];
	}
	return false;
}

/**
 * @return
 * the menu item which is a submenu with the given attributes
 */
function getSubmenu(mitem, document) {
	let item = document.createElementNS(NS_XUL, "menu");
	item.setAttribute("id", mitem.id);
	item.setAttribute("label", mitem.label);

	mitem.id += "-popup";
	let menu = getMenu(mitem, document);
	menu.setAttribute("contextmenu", item.id);
	menu.setAttribute("position", "end_before");
	item.appendChild(menu);

	if(mitem.image) {
		item.setAttribute("class", "menu-iconic");
		item.setAttribute("image", mitem.image);
	}
	else {
		item.setAttribute("class", "menu");
	}

	return item;
}

/**
 * @return
 * the menu item with the given attributes
 */
function getMenuItem(mitem, document) {
	let item = document.createElementNS(NS_XUL, "menuitem");

	item.setAttribute("class", "menuitem");
	if(mitem.image) {
		item.setAttribute("class", "menuitem-iconic");
		item.setAttribute("image", mitem.image);
	}
	if(mitem.type) {
		item.setAttribute("type", mitem.type);
		if(mitem.checked) {
			item.setAttribute("checked", mitem.checked);
		}
	}
	if(mitem.name) {
		item.setAttribute("name", mitem.name);
		item.setAttribute("group", mitem.name);
	}
	item.setAttribute("id", mitem.id);
	item.setAttribute("label", mitem.label);
	if(mitem.tooltiptext) {
		item.setAttribute("tooltiptext", mitem.tooltiptext);
	}

	item.addEventListener("command", mitem.onCommand, true);

	return item;
}

/**
 * @return
 * the menu with the given attributes
 */
function getMenu(settings, document) {
	let menu = document.createElementNS(NS_XUL, "menupopup");
	menu.setAttribute("id",             settings.id);
	menu.setAttribute("type",           "menu");
	menu.setAttribute("position",       "after_start");
	if(settings.onShow)menu.addEventListener("popupshowing", settings.onShow);
	if(settings.onHide)menu.addEventListener("popuphiding",  settings.onHide);
	
	settings.items.forEach(function(mitem){
		/* separator */
		if(!mitem) {
			menu.appendChild(document.createElementNS(NS_XUL, "menuseparator"));
		}
		/* submenu */
		else if(mitem.type=="menu") {
			menu.appendChild(getSubmenu(mitem, document));
		}
		/* regular menu entry */
		else {
			menu.appendChild(getMenuItem(mitem, document));
		}
	});

	return menu;
}

/**
 * @return
 * the button with the given attributes
 */
function getButton(settings, document) {
	settings.type = (settings.menu ? "menu-button" : "button");

	/* if the button already exists in the document, return it */
	if(document.getElementById(settings.id))
		return document.getElementById(settings.id);

	let button = document.createElementNS(NS_XUL, "toolbarbutton");
	button.setAttribute("id",     settings.id);
	button.setAttribute("type",   settings.type);
	button.setAttribute("class",  "toolbarbutton-1 chromeclass-toolbar-additional");
	button.setAttribute("image",  settings.image);
	button.setAttribute("orient", "horizontal");
	button.setAttribute("label",  settings.label);

	button.addEventListener("command", function(evt) {
		// prevent the button command if a menu entry has been selected
		if(evt.target.id !== settings.id)
			return;
		settings.onCommand(evt);
	}, true);
	if(settings.onClick) button.addEventListener("click", settings.onClick, true);

	if(settings.menu) {
		button.appendChild(getMenu(settings.menu, document));
		button.setAttribute("contextmenu", settings.menu.id);
	}

	return button;
}


/**
 * @return
 * the button with the given attributes, or null if no button was created
 */
function initializeButton(settings, document) {

	let button  = getButton(settings, document);

	// check if a toolbox exists e.g. the window is a regular navigator window 
	let toolbox = document.getElementById("navigator-toolbox");
	if(!toolbox)
		return;

	let palette = toolbox.palette;

	palette.appendChild(button);
	palette.insertBefore(button, null);

	let toolbar = getButtonToolbar(settings.id, document);
	// if the button already is in a toolbars currentset 
	if(toolbar !== false) {
		// insert the button to the position the user positioned it, so it will be visible
		let currentset = toolbar.getAttribute("currentset").split(",");
		let btnindex = currentset.indexOf(settings.id);
		let nextindex = null;
		if(btnindex > -1) {
			for(let i = btnindex+1; i < currentset.length; ++i) {
				if(currentset[i].length > 0)
					nextindex = document.getElementById(currentset[i]);
				if(nextindex) {
					toolbar.insertItem(settings.id, nextindex, null, true);
					break;
				}
			}
		}
		if(!nextindex) {
			toolbar.insertItem(settings.id, null, null, false);
		}
	}
	// else, on the addons first start, put the button in the toolbar 
	else if(setupReason == ADDON_INSTALL || setupReason == ADDON_ENABLE || setupReason == ADDON_UPGRADE || setupReason == ADDON_DOWNGRADE) {
		let targetToolbar = document.getElementById(settings.toolbar);
		let currentSet = targetToolbar.currentSet;

		currentSet += ","+settings.id;

		targetToolbar.currentSet = currentSet;
		targetToolbar.setAttribute("currentset", currentSet);

		document.persist(settings.toolbar, "currentset");
	}
	// else if button isn't anywhere 
	else {
		// don't do anything
	}

	return button;
}

/**
 * @return
 * an array of all browser windows
 */
function getBrowserWindows() {
	let list = [];
	let windows = Services.wm.getEnumerator("navigator:browser");
	while (windows.hasMoreElements()) {
		let window = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
		list.push(window);
	}
	return list;
}




/**
 * removes a toolbar button with the given id
 */
function removeButton(id, toolbar, fromCurrentset) {
	let windows = getBrowserWindows();
	for(let i = 0; i < windows.length; ++i) 
	{
		var document = windows[i].document;	
		var button = document.getElementById(id);
		if (button) {
			try {
				button.parentNode.removeChild(button);
			}
			catch(e) {
				//console.log(e);
			}
		}
		if(fromCurrentset === true) {
			// additionally remove the button from the currentset
			let currentset = toolbar.getAttribute("currentset").split(",");
			if(currentset.indexOf(id) > -1) {
				let newCurrentset = [];
				for(let i = 0; i < currentset.length; ++i) {
					if(currentset[i] !== id)
						newCurrentset.push(currentset[i]);
				}
				newCurrentset = newCurrentset.join(",");
				toolbar.setAttribute("currentset", newCurrentset);
				toolbar.currentSet = newCurrentset;	
				document.persist(newCurrentset, "currentset");
			}
		}

	}
};
exports.removeButton = removeButton;

/**
 * creates buttons with the given settings
 */
function createButton(settings) {

	let windows = getBrowserWindows();
	for(let i = 0; i < windows.length; ++i) {
			initializeButton(settings, windows[i].document);
	}
	
	let observer = {
		observe: function(sub,top,dat) {
			if(top=="domwindowopened") {
				let window = sub;				
				let listenToWindow = {
						handleEvent: function() {
						// call the buttons update method if implemented 
						if(settings.update)
							settings.update();
						initializeButton(settings, window.document);
					}
				};

				window.addEventListener("load", listenToWindow, true);
				registerShutdownCallback(function(reason){
					window.removeEventListener("load", listenToWindow, true);
				});
			}
		}
	};

	Services.ww.registerNotification(observer);
	/* remove the observer on extension shutdown 
	 * and the button on uninstallation */
	registerShutdownCallback(function(reason) {
		Services.ww.unregisterNotification(observer);
		let rb = removeButton;

		if(reason==ADDON_DISABLE||reason==ADDON_UNINSTALL||reason==ADDON_UPGRADE||reason==ADDON_DOWNGRADE) {
			rb(settings.id, settings.toolbar, false);
		}
	});

	// first start is over
	setupReason = null;
};
exports.createButton = createButton;

/**
 * updates an attribute of a button
 * removes the attribute if value is null or undefined
 *
 * @return
 * the quantity of updated buttons
 */
 function updateAttribute(id, attribute, value) {
	let windows = getBrowserWindows();
	let btncount = 0;
	for(let i = 0; i < windows.length; ++i) {
		/*
		// The long way 

		let toolbars = windows[i].document.getElementsByTagNameNS(NS_XUL, "toolbar");
		for(let j = 0; j < toolbars.length; ++j) {
			let toolbar = toolbars[j];
			let oldButtons = toolbar.getElementsByClassName("toolbarbutton-1");
			for(let k = 0; k < oldButtons.length; ++k) {
				if(oldButtons[k].getAttribute("id") == id)
				{
					oldButtons[k].setAttribute(attribute, value);
					++btncount;
				}
			}

		}*/

		// The short way
		// behave: works for every window element, not only toolbar buttons
		let btn = windows[i].document.getElementById(id);
		if(btn) {
			if(value===null||value===undefined)
				btn.removeAttribute(attribute);
			else 
				btn.setAttribute(attribute, value);
			++btncount;
		}
	}
	return btncount;
};
exports.updateAttribute = updateAttribute;
