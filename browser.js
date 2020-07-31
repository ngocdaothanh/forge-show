const keytar = require('keytar')
const puppeteer = require('puppeteer')

const SERVICE = 'forge-show'
const ACCOUNT = 'cookies'

const launchBrowser = async () => {
  return await puppeteer.launch({headless: false, defaultViewport: null})
}

const newPage = async (browser, url) => {
  // Avoid the annoying permission prompt,
  // asking for permisions like geolocation, notifications etc.;
  // permisions not in the list will automatically be denied
  const context = browser.defaultBrowserContext()
  context.overridePermissions(url, [])

  // Try restoring cookies
  const page = await browser.newPage()
  await restoreCookies(page)

  // User may need to authenticate to see the page
  await page.goto(url, {waitUntil: 'networkidle0'})
  await page.waitForRequest(url, {timeout: 0})

  // Update cookies, in case the user has authenticated
  await storeCookies(page)

  return page
}

const storeCookies = async (page) => {
  const cookies = await page.cookies()
  const string = JSON.stringify(cookies)
  await keytar.setPassword(SERVICE, ACCOUNT, string)
}

const restoreCookies = async (page) => {
  const string = await keytar.getPassword(SERVICE, ACCOUNT)
  if (string) {
    try {
      const cookies = JSON.parse(string)
      await page.setCookie(...cookies)
    } catch {
      await keytar.deletePassword(SERVICE, ACCOUNT)
    }
  }
}

module.exports = {
  launchBrowser,
  newPage,
  storeCookies,
  restoreCookies
}
