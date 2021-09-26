// ==UserScript==
// @name        Lofter Memory Helper Script
// @namespace   https://github.com/lightyears1998/lofter-memory
// @match       *://www.lofter.com/like
// @grant       window
// @grant       GM_xmlhttpRequest
// @version     1.0
// @author      lightyears1998
// @description
// ==/UserScript==

// [Reference]
// https://stackoverflow.com/questions/2844565/is-there-a-javascript-jquery-dom-change-listener
// https://wangdoc.com/javascript/dom/element.html#elementclassnameelementclasslist

"use strict";

const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

setup();

function setup() {
  const observer = new MutationObserver(domMutationHandler);

  const main = document.getElementById("main");
  observer.observe(main, {
    subtree: true,
    childList: true,
    attributes: true
  });
}

function domMutationHandler(mutations) {
  for (const mu of mutations) {
    const target = mu.target;
    const postItem = target.closest(".m-mlist"); // Find the closest .m-mlist element on the element itself and its parents.
    if (postItem && postItem.classList.contains("m-mlist")) {
      let postUrl = "";
      let postPublishDate = "";
      let text = "";
      let imageUrls = [];

      const postMetaNode = postItem.querySelector(".isayc");
      if (!postMetaNode) {
        console.warn("Weird: Cannot find postUrl.", postItem);
        continue;
      }
      postUrl = postMetaNode.href;
      postPublishDate = postMetaNode.title.match(/(\d{4}\/)?\d{2}\/\d{2} \d{2}:\d{2}/g)[0] || "";

      const textNodes = postItem.querySelectorAll(".txt");
      if (textNodes.length > 0) {
        if (textNodes.length !== 2) {
          console.warn(`Weird: the number of txt nodes of each .m-mlist element should be 2, but ${textNodes.length} here.`, textNodes);
        }
        const html1 = textNodes[0].innerHTML;
        const html2 = textNodes[1] ? textNodes[1].innerHTML: "";
        const realHtml = html1.length > html2.length ? html1 : html2;
        text = realHtml;
      }

      const imgNodes = postItem.querySelectorAll(".imgc");
      for (const imgNode of imgNodes) {
        const innerNode = imgNode.querySelector("a img");
        if (innerNode) {
          imageUrls.push(innerNode.src);
        }
      }

      if (text || imageUrls.length > 0) {
        debouncePostData(postUrl, {
          postUrl, postPublishDate, text, imageUrls
        });
      }
    }
  }
}

const fireMap = new Map();
function debouncePostData(postUrl, data) {
  let timer = fireMap.get(postUrl);
  if (timer) {
    clearTimeout(timer);
  }
  timer = setTimeout(() => postData(postUrl, data), 200);
  fireMap.set(postUrl, timer);
}

function postData(postUrl, data) {
  GM_xmlhttpRequest({
    method: "POST",
    url: "http://localhost:7670",
    headers: { "Content-Type": "application/json" },
    data: JSON.stringify(data),
    onerror: function (res) {
      console.log("Error posting data", postUrl, data);
    }
  });
  console.log(`Posted: ${postUrl}`);
}
