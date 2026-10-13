//#region Constants
// URL prefixes where Chrome blocks script injection (browser UI, extension pages, the Web Store).
const RESTRICTED_URL_PREFIXES = [
  'chrome://',
  'chrome-extension://',
  'edge://',
  'about:',
  'https://chrome.google.com/webstore',
  'https://chromewebstore.google.com',
]
//#endregion Constants

//#region Helpers
/**
 * Returns true when a tab's URL is known to block script injection: browser/extension pages,
 * the Web Store, or the built-in PDF viewer (detected heuristically by file extension, since
 * there is no API to query the renderer type directly).
 */
export const isRestrictedUrl = (url: string): boolean => {
  if (!url) return false
  const lower = url.toLowerCase()
  if (lower.endsWith('.pdf')) return true
  return RESTRICTED_URL_PREFIXES.some((prefix) => lower.startsWith(prefix))
}
//#endregion Helpers
