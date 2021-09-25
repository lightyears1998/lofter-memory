/**
 *
 * @param {String} postUrl
 */
export function getUsernameFromPostUrl(postUrl) {
  const matchGroup = postUrl.match(/https?:\/\/(.*)\.lofter.com/);
  if (matchGroup.length === 2) {
    return matchGroup[1];
  }
  throw new Error("Fail to parse username from postUrl");
}

/**
 *
 * @param {String} postUrl
 * @returns {String}
 */
export function getPostIdFromPostUrl(postUrl) {
  const matchGroup = postUrl.match(/https?:\/\/.*\.lofter.com\/post\/(.*)/);
  if (matchGroup.length === 2) {
    return matchGroup[1];
  }
  throw new Error("Fail to parse postId from postUrl");
}

/**
 *
 * @param {String[]} imageUrls
 * @returns {String[]}
 */
export function handleImageUrls(imageUrls) {
  // 移除空URl
  const nonEmptyUrls = imageUrls.filter(url => url !== "");

  // 移除 QueryString
  const pureImageUrls = nonEmptyUrls.map(url => url.trim()).map(url => removeQueryStringFromUrl(url));

  // 去重
  const uniqueUrls = [];
  for (const url of pureImageUrls) {
    if (uniqueUrls.indexOf(url) === -1) {
      uniqueUrls.push(url);
    }
  }

  return uniqueUrls;
}

/**
 *
 * @param {String} url
 * @returns {String}
 */
export function removeQueryStringFromUrl(url) {
  const questionMarkIndex = url.indexOf("?");
  return questionMarkIndex !== -1 ? url.substr(0, questionMarkIndex) : url;
}
