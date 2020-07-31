const {launchBrowser, newPage} = require('./browser')
const {deploy} = require('./forge')

const launchPage = async (pageUrl, showFn) => {
  const browser = await launchBrowser()

  const page = await newPage(browser, pageUrl)
  await showFn(page)

  await browser.close()
}

module.exports = {
  deploy,
  launchBrowser,
  newPage,
  launchPage
}
