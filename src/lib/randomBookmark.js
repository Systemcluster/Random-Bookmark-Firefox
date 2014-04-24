/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* extension: Random Bookmark 
 * version: 2.2
 * created at: 2012-12-28
 * author: Christian Sdunek
 */

"use strict";

var bookmarksService = Cc["@mozilla.org/browser/nav-bookmarks-service;1"].getService(Ci.nsINavBookmarksService);
var historyService = Cc["@mozilla.org/browser/nav-history-service;1"].getService(Ci.nsINavHistoryService);

let l10n = require("l10n");
let settings = require("settings");

/**
 * @return
 * the node to a given folder id
 */
function getResultNode(folders){
    let options = historyService.getNewQueryOptions();
    let query = historyService.getNewQuery();    
    
    query.setFolders(folders,1);
    
    let result = historyService.executeQuery(query,options);
    let resultNode = result.root;
    
    return resultNode;
}

/**
 * @return 
 * childs to a given root, recursively
 */
function getChilds(rootNode, filters){
	let rootNodeChild = null;
    let childs = new Array();
    
    for (let i = 0; i < rootNode.childCount; i++) {
		rootNodeChild = rootNode.getChild(i);
        
        /* if node is a bookmark */
        if(rootNodeChild.type === 0){

            /* check if uri applies a filter */
            if(filters) for(let j = 0; j < filters.length; ++j) {
                let reg = new RegExp("^(http(s){0,1}://){0,1}(www.){0,1}("+filters[j]+"){1}.*$");
                if(reg.test(rootNodeChild.uri)) {
                   childs.push(rootNodeChild);
                   continue;
                }
            }
            else {
                childs.push(rootNodeChild);
            }

        }
        /* if node is a folder */
        else{
            let resultNode = getResultNode([rootNodeChild.itemId]);
            resultNode.containerOpen = true;
            childs = childs.concat(getChilds(resultNode, (filters?filters:null)));
            resultNode.containerOpen = false;
        }
    }
    return childs;
}
/**
 * @return
 * all bookmarks
 */
function getAllBookmarks(filters, source){

    let childs = new Array();

    if(source === "menu") {
        let rootNode = getResultNode([bookmarksService.bookmarksMenuFolder]);
        rootNode.containerOpen = true;
        childs = childs.concat(getChilds(rootNode, (filters?filters:null)));
        rootNode.containerOpen = false;
    }
    else if(source === "toolbar") {
        let rootNode = getResultNode([bookmarksService.toolbarFolder]);
        rootNode.containerOpen = true;
        childs = childs.concat(getChilds(rootNode, (filters?filters:null)));  
        rootNode.containerOpen = false;
    }
    else if(source === "unfiled") {
        let rootNode = getResultNode([bookmarksService.unfiledBookmarksFolder]);
        rootNode.containerOpen = true;
        childs = childs.concat(getChilds(rootNode, (filters?filters:null)));  
        rootNode.containerOpen = false;


    }
    else { // root || undefined
        let rootNode = getResultNode([bookmarksService.bookmarksMenuFolder]);
        rootNode.containerOpen = true;
        childs = childs.concat(getChilds(rootNode, (filters?filters:null)));  
        rootNode.containerOpen = false;

        rootNode = getResultNode([bookmarksService.toolbarFolder]);
        rootNode.containerOpen = true;
        childs = childs.concat(getChilds(rootNode, (filters?filters:null)));  
        rootNode.containerOpen = false;

        rootNode = getResultNode([bookmarksService.unfiledBookmarksFolder]);
        rootNode.containerOpen = true;
        childs = childs.concat(getChilds(rootNode, (filters?filters:null)));  
        rootNode.containerOpen = false;
    }

    return childs;
}

/**
 * @params filters
 * An array containing the filter strings that define the URLs that this function return
 * or null if no filtering should be applied
 * @return
 * An URL string selected randomly or null.
 */
exports.getRandomURL = function getRandomURL(filters, source, normalized) {
	let childs = getAllBookmarks(filters, source);

    if(childs.length < 1) {
        // no bookmark at all
        return null;
    }

	// TODO: use better rand function
	let rand = Math.floor(Math.random() * childs.length);
	return childs[rand].uri;
};
