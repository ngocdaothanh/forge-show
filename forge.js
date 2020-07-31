const {run} = require('./cmd')
const {newPage, storeCookies} = require('./browser')

const AUTH_PROMPT = 'Press any key to open the URL in your default browser.'
const LATEST_VERSION_ALREADY_INSTALLED = 'The latest version of the app is already installed on the site'
const AUTH_URL_PATTERN = /(https:\/\/id.atlassian.com\/outboundAuth.+?)\n/

const deploy = async (env) => {
  await run(`forge deploy --environment ${env}`)
}

// Returns auth URL, or '' if the latest version of the app is already installed.
const install = async (siteUrl, env) => {
  try {
    const installOutput = await run(
      `forge install --site ${siteUrl} --product confluence --environment ${env}`,
      {onOutput: (output, requestKill) => {
        // Prevent the auth link to be opened by system browser
        if (output.includes(AUTH_PROMPT)) {
          requestKill()
        }
      }}
    )

    const match = installOutput.match(AUTH_URL_PATTERN)
    if (!match) {
      throw new Error('Could not find auth link in "forge install" output')
    }

    return match[1]
  } catch (e) {
    if (e.stack.includes(LATEST_VERSION_ALREADY_INSTALLED)) {
      return ''
    }
    throw e
  }
}

const auth = async (browser, authUrl, siteUrl) => {
  const page = await newPage(browser, authUrl)

  // Wait until the user has authenticated,
  // then store cookies for future sessions
  await page.waitForXPath('//div[text()="Choose a site"]', {timeout: 0})
  await storeCookies(page)

  // TODO Choose site automatically
  await page.waitForXPath('//p[text()="Your app is now authenticated with Atlassian."]', {timeout: 0})

  // Delay a little so that user can see the success page
  await page.waitFor(3000)
  await page.close()
}

module.exports = {
  deploy,
  install,
  auth
}
