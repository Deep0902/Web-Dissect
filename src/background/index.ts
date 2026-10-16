// const handleOnPageClick = (info: any, tab: any) => {
//   console.log("Context Info: ", info);
//   console.log("Context Tab: ", tab);
// };

// const handleOnSelectionClick = (info: any, tab: any) => {
//   console.log("Context Info: ", info);
//   console.log("Context Tab: ", tab);
// };

export default chrome.runtime.onInstalled.addListener(() => {
  console.log("Background Service Worker working...");

  // Temporarily disabled; restore this block to re-enable the page and selection menu options.
  /*
  chrome.contextMenus.create({
    id: "some-id-page",
    title: "New Menu Option - Page",
    contexts: ["page"],
  });
  chrome.contextMenus.create({
    id: "some-id-selection",
    title: "New Menu Option - Selection",
    contexts: ["selection"],
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    const { menuItemId } = info;

    if (menuItemId === "some-id-page") handleOnPageClick(info, tab);

    if (menuItemId === "some-id-selection") handleOnSelectionClick(info, tab);
  });
  */
});

// DEBUG ONLY: print logs forwarded from the side panel
chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "DEBUG_LOG") {
    console.log("[SidePanel]", message.step, message.data ?? "");
  }
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "open_side_panel") {
    chrome.windows.getCurrent((w) => {
      chrome.sidePanel.open({ windowId: w.id! });
      console.log("Command/Ctrl + O triggered! :)");
    });
  }
});
