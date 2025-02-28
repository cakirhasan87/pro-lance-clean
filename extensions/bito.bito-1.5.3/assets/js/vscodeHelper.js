// @ts-nocheck
let vscode;

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
  console.log(" load helper js file ");
  if (typeof acquireVsCodeApi === 'function') {
    try {
      vscode = acquireVsCodeApi();
    } catch (e) {
      console.log('Failed to acquire VSCode API:', e);
      vscode = {};
    }
  } else {
    console.log('Running outside VSCode context - VSCode API not available');
    vscode = {};
  }

  // stop default context menu inside BITO webview view
  document.addEventListener("contextmenu", (event) => {

    const detectedOS = getOperatingSystem();
    console.log("detected os === ", detectedOS);

    if(detectedOS === "windows") {
      event.preventDefault();
    }
  });

  try {

    var extensionProps = getBitoExtnProps();
    localStorage.setItem("extensionProps", JSON.stringify(extensionProps));

  } catch(error) {
    console.log("error occurred to set local storage items ", error);
  }

  // Handle the message inside the webview
  window.addEventListener("message", (event) => {
    let message = event.data;
    console.log('add event listener ==  ' , message);
    switch (message.command) {
      case "active_fileInfo":
        fireAngularEvent("active_fileInfo", [message.transferObj]);
        break;
      case "open-email-in-external-browser":
        vscode.postMessage({
          command: "open-email-in-external-browser",
          openUrl: message.transferObject,
        });
        break;
      case "open-in-external-browser":
        vscode.postMessage({
          command: "open-in-external-browser",
          openUrl: message.transferObject,
        });
        break;
      case "clean_up_resources_vs_code_extension":
        vscode.postMessage({
          command: "clean_up_resources_vs_code_extension",
          details: "",
        });
        break;
      case "editor-retrive-file-discussion":
        vscode.postMessage({
          command: "editor-retrive-file-discussion",
        });
        break;
      case "show_fileInfo_in_file_tab":
        vscode.postMessage({
          command: "show_fileInfo_in_file_tab",
          details: message.transferObject,
        });
        break;
      case "file-diff":
        console.log('inside file-diff');
        vscode.postMessage({
          command: "file-diff",
          details: message.transferObject,
        });
        break;  
      case "reload_on_refresh":
        console.log("reload after refresh VSC");
        vscode.postMessage({
          command: "reload_on_refresh",
          details: {},
        });
        break;
      case "update-appearance":
        console.log("inside helper.js : update-appearance");
        vscode.postMessage({
          command: "update-appearance",
          details: message.transferObject,
        });
        break;
    }
  });
})();

/**
 * Get operating system from browser's user agent header
 */
function getOperatingSystem() {
  let detectedOS = "";

  const userAgentInfo = navigator.userAgent;

  if(userAgentInfo.search("Windows") !== -1) {
    detectedOS = "windows";
  } else if (userAgentInfo.search('X11')!==-1 && !(userAgentInfo.search('Linux')!==-1)){
    detectedOS="unix";
  } else if (userAgentInfo.search('Linux')!==-1 && userAgentInfo.search('X11')!==-1){
    detectedOS="linux";
  } else if(userAgentInfo.search("Mac")!== -1) {
    detectedOS="macOS";
  }

  return detectedOS;
}

function getBitoExtnProps() {

  const extensionProps = {
    extensionFor: document.getElementById("extensionFor").value,
    resourcePath: document.getElementById("resourcePath").value,
    portNumber: document.getElementById("portNumber").value,
    serverHost: document.getElementById("serverHost").value,
    uId: document.getElementById("uId").value,
    productName: document.getElementById("productName").value,
    parentIdeName: document.getElementById("parentIdeName").value,
    bitoVersion: document.getElementById("bitoVersion").value,
    userLoginStatus: document.getElementById("userLoginStatus").value,
    theme: document.getElementById("theme").value,
    fontSize: document.getElementById("fontSize").value,
    fontFamily: document.getElementById("fontFamily").value,
    deviceId: document.getElementById("deviceId").value,

  };

  return extensionProps;
}
