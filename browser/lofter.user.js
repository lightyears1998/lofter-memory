// ==UserScript==
// @name        Lofter Memory Helper Script
// @namespace   https://github.com/lightyears1998/lofter-memory
// @match       *://www.lofter.com/like
// @grant       GM_xmlhttpRequest
// @version     1.0
// @author      lightyears1998
// @description
// ==/UserScript==

// [Reference]
// https://stackoverflow.com/questions/2844565/is-there-a-javascript-jquery-dom-change-listener
// https://wangdoc.com/javascript/dom/element.html#elementclassnameelementclasslist

const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

setup();

function setup() {
  const observer = new MutationObserver(function (mutations) {
    for (const mu of mutations) {
      const target = mu.target;
      if (target.classList.contains("m-mlist")) {
        let postUrl = "";
        let postPublishData = "";
        let txt = "";
        let img = [];

        const postMetaNode = target.querySelector(".isayc");
        if (!postMetaNode) {
          console.warn("Weird: Cannot find postUrl.", target);
          continue;
        }
        postUrl = postMetaNode.href;
        postPublishData = postMetaNode.title.match(/\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}/g)[0] || "";

        const txtNodes = target.querySelectorAll(".txt");
        if (txtNodes.length > 0) {
          if (txtNodes.length !== 2) {
            console.warn(`Weird: the number of txt nodes of each .m-mlist element should be 2, but ${txtNodes.length} here.`, txtNodes);
          }
          const html1 = txtNodes[0].innerHTML;
          const html2 = txtNodes[1] ? txtNodes[1].innerHTML: "";
          const realHtml = html1.length > html2.length ? html1 : html2;
          txt = realHtml;
        }

        const imgNodes = target.querySelectorAll(".imgc");
        for (const imgNode of imgNodes) {
          const innerNode = imgNode.querySelector("a img");
          if (innerNode) {
            img.push(innerNode.src);
          }
        }

        if (txt || img.length > 0) {
          postData(postUrl, {
            target, postUrl, postPublishData, txt, img
          });
        }
      }
    }
  });

  const main = document.getElementById("main");
  observer.observe(main, {
    subtree: true,
    attributes: true
  });
}

function postData(postUrl, data) {
  GM_xmlhttpRequest({
    method: "POST",
    url: "http://localhost:7670",
    headers: { "Content-Type": "application/json" },
    data: JSON.stringify(data),
    onerror: function (res) {
      console.log(res);
    }
  });
  console.log(`Posted: ${postUrl}, ${data}`);
}
