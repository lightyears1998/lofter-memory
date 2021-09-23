// ==UserScript==
// @name        Lofter Memory Helper Script
// @namespace   https://github.com/lightyears1998/lofter-memory
// @match       *://www.lofter.com/like
// @grant       none
// @version     1.0
// @author      lightyears1998
// @description
// ==/UserScript==

const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

setup();

function setup() {
  // https://stackoverflow.com/questions/2844565/is-there-a-javascript-jquery-dom-change-listener
  // https://wangdoc.com/javascript/dom/element.html#elementclassnameelementclasslist
}

function handleList() {
  const main = document.getElementById("main");
  if (main) {
    const childNodes = main.childNodes;
    for (const node of childNodes) {
      console.log(node.nodeType)
      if (node.nodeType !== Node.ELEMENT_NODE) { // skip text nodes, etc.
        continue;
      }
      console.log(node.classList)
      if (node.classList.contains("m-mlist")) {
        console.log(node)
      }
    }
  }
}

function postData(data) {

}
