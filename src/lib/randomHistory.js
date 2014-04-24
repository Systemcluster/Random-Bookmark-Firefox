/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* extension: Random Bookmark 
 * version: 2.2
 * created at: 2012-12-28
 * author: Christian Sdunek
 */
 
"use strict";

var historyService = Cc["@mozilla.org/browser/nav-history-service;1"].getService(Ci.nsINavHistoryService);

/**
 * @params filters
 * An object containing the filter strings that define the URLs that this function returns
 * or null if no filtering should be applied
 * @return
 * An URL string selected randomly or null.
 * 
 * @note
 * this may take a while if the history is long.
 */

exports.getRandomURL = function getRandomURL(filters, normalized) {
    let options = historyService.getNewQueryOptions();
    let query = historyService.getNewQuery();    
    
    let result = historyService.executeQuery(query,options);
    let resultNode = result.root;
    
    resultNode.containerOpen = true;
    if(resultNode.childCount < 1){
		resultNode.containerOpen = false;
        // no entries at all
        return null;
    }

    let randomElement = null;

	if(filters) {
		let filteredChilds = [];
		/* for each result */
		for(let i = 0; i < resultNode.childCount; ++i) {
			/* for each filter */
			for(let j = 0; j < filters.length; ++j) {
				let reg = new RegExp("^(http(s){0,1}://){0,1}(www.){0,1}("+filters[j]+"){1}.*$");
				if(reg.test(resultNode.getChild(i).uri)) {
					/* normalize probability */
					if(!normalized || filteredChilds.indexOf(resultNode.getChild(i).uri) === -1) {
						filteredChilds.push(resultNode.getChild(i).uri);
					}
				}
			}
		}
		if(filteredChilds.length < 1) {
			resultNode.containerOpen = false;
			// no entries for filter
			return null;
		}
		else {
			let rand = Math.floor(Math.random()*filteredChilds.length);
			randomElement = filteredChilds[rand];
		}
	}
	else {
		// TODO: normalize result probability without filter
		// WITHOUT slowing down the whole process
		let rand = Math.floor(Math.random()*resultNode.childCount);
		randomElement = resultNode.getChild(rand).uri;
	}
	
    resultNode.containerOpen = false;

    return randomElement;
};
