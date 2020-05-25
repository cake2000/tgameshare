function getElementByXpath(path) {
  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}


setInterval(() => {
  // var targetPane = getElementByXpath("/html/body/div[1]/div/div[3]/div/div[2]/div[2]/div/div[1]/div[3]");
  // if (targetPane) targetPane.style.visibility = "hidden";
}, 1000);

