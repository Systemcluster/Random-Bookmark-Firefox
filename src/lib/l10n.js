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

let l10n = Cc["@mozilla.org/intl/stringbundle;1"].getService(Ci.nsIStringBundleService);
let l10nBundle = l10n.createBundle("chrome://random-bookmark/locale/default.properties");

registerShutdownCallback(function(reason) {
	if(reason==5||reason==7||reason==8)
		l10n.flushBundles();
});

exports.getLocalized = function getLocalized(string) {
    try {
        return l10nBundle.GetStringFromName(string);
    } catch(e) {
        return string;
    }
};
