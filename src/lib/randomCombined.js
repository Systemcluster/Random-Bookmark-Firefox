/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. 
 */

/* by using this source code for your own projects,
 * be sure to give proper credit to the original author.
 */

/* extension: Random Bookmark 
 * version: 2.1
 * created at: 2012-12-28
 * author: Christian Sdunek
 *
 * notes: 
 *  requires some methods and vars from the specific bootstrap
 */

"use strict";

var bookmarks = require("randomBookmark");
var history = require("randomHistory");

exports.getRandomURL = function getRandomURL(filters, source, normalized) {
	if(!normalized) {
		let n = Math.floor(Math.random());
		if(n<0.5) return bookmarks.getRandomURL(filters, source, normalized);
		else return history.getRandomURL(filters, normalized);
	}
	else {
		let vars = [];
		let bm = bookmarks.getRandomURL(filters, source, normalized);
		let hs = history.getRandomURL(filters, normalized);
		if(bm) vars.push(bm);
		if(hs) vars.push(hs);
		if(vars.length<1)
			return null;
		let rand = Math.floor(Math.random()*vars.length);
		return vars[rand];
	}
};
