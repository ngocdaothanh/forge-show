const {launchBrowser, newPage} = require('./browser')
const {deploy} = require('./forge')

const show = async (pageUrl, env, showFn) => {
  await deploy(env)

  const browser = await launchBrowser()

  const page = await newPage(browser, pageUrl)
  await showFn(page)

  await browser.close()
}

module.exports = show
