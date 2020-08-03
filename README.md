# Forge Show

This is a tool to help automate the process of deploying and creating
screenshots/screencasts to demo your
Atlassian [Forge](https://developer.atlassian.com/platform/forge/) apps.

This tool does not install and add your apps to a product site, because:
* You usually want to manually set up your apps to have a good look,
  before taking screenshots/screencasts.
* You usually only need to set up once.

## Install

Add `forge-show` dev dependency to your Forge app:

```bash
npm install forge-show --save-dev
```

Add to the `scripts` section in package.json of your Forge app:

```json
"scripts": {
  "show": "node forge-show.js"
},
```

## forge-show.js example

```js
const {deploy, launchPage} = require('forge-show')

const ENVIRONMENT = 'development'
const PAGE_URL = 'https://site.atlassian.net/page/where/you/have/installed/the/app'

const main = async () => {
  await deploy(ENVIRONMENT)

  // It's show time, do whatever you want to show!
  // page: https://github.com/puppeteer/puppeteer/blob/main/docs/api.md
  await launchPage(PAGE_URL, async (page) => {
    // Click the "spin" button and wait for it to spin
    // https://bitbucket.org/atlassian/forge-wheel-of-fortune
    const buttonSelector = '[data-testid="ForgeExtensionContainer"] button'
    await page.waitFor(buttonSelector)
    await page.click(buttonSelector)
    await page.waitFor(10000)

    // Take screenshot
    const body = await page.$('.ak-renderer-document')
    await body.screenshot({path: './body.png'})
  })
}

main()
```

## Run

When you run `npm run show`, the script will:
* run `forge deploy --environment ENVIRONMENT`
* run `forge tunnel` (if `ENVIRONMENT` is `development`)
* open `PAGE_URL` in [Puppeteer](https://github.com/puppeteer/puppeteer) browser,
  you may have to manually login if the page is not public
* run demo and take screenshots/screencasts
* terminate the tunnel (if started)

For your convenience so that you won't have to manually login again each time
you run the script, the browser cookies are securely stored with
[keytar](https://github.com/atom/node-keytar).
