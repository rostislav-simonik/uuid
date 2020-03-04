/* global browser:false */
/* eslint-disable camelcase */
const util = require('util');

const browserstack = require('browserstack-local');
const httpServer = require('http-server');

const PORT = 9003;
const PROJECT = process.env.GITHUB_REPOSITORY || 'node-uuid';
const GITHUB_SHA = process.env.GITHUB_SHA || '';
const GITHUB_REF = process.env.GITHUB_REF || '';
const BUILD = GITHUB_SHA || GITHUB_REF ? `${GITHUB_REF} ${GITHUB_SHA}` : 'manual build';

const commonCapabilities = {
  project: PROJECT,
  build: BUILD,
  name: 'browser test',
  'browserstack.local': true,
  'browserstack.debug': false,
  resolution: '1024x768',
};

const multiCapabilities = [
  // Chrome
  {
    ...commonCapabilities,
    browserName: 'Chrome',
    browser_version: '80.0',
    os: 'Windows',
    os_version: '10',
  },
  {
    ...commonCapabilities,
    browserName: 'Chrome',
    browser_version: '49.0',
    os: 'Windows',
    os_version: '10',
  },

  // Firefox
  {
    ...commonCapabilities,
    browserName: 'Firefox',
    browser_version: '73.0',
    os: 'Windows',
    os_version: '10',
  },
  {
    ...commonCapabilities,
    browserName: 'Firefox',
    browser_version: '44.0',
    os: 'Windows',
    os_version: '10',
  },

  // Safari
  {
    ...commonCapabilities,
    browserName: 'Safari',
    browser_version: '13.0',
    os: 'OS X',
    os_version: 'Catalina',
  },
  {
    ...commonCapabilities,
    browserName: 'Safari',
    browser_version: '10.0',
    os: 'OS X',
    os_version: 'Sierra',
  },

  // Edge
  {
    ...commonCapabilities,
    browserName: 'Edge',
    browser_version: '80.0',
    os: 'Windows',
    os_version: '10',
  },
  {
    ...commonCapabilities,
    browserName: 'Edge',
    browser_version: '18.0',
    os: 'Windows',
    os_version: '10',
  },
  {
    ...commonCapabilities,
    browserName: 'Edge',
    browser_version: '15.0',
    os: 'Windows',
    os_version: '10',
  },

  // IE
  {
    ...commonCapabilities,
    browserName: 'IE',
    browser_version: '11.0',
    os: 'Windows',
    os_version: '10',
  },
  {
    ...commonCapabilities,
    browserName: 'IE',
    browser_version: '11.0',
    os: 'Windows',
    os_version: '7',
  },
];

let server;
let bsLocal;

exports.config = {
  specs: ['./browser.spec.js'],
  browserstackUser: process.env.BROWSERSTACK_USER || 'BROWSERSTACK_USERNAME',
  browserstackKey: process.env.BROWSERSTACK_ACCESS_KEY || 'BROWSERSTACK_ACCESS_KEY',

  multiCapabilities,
  maxSessions: 5, // see https://www.browserstack.com/question/617
  getPageTimeout: 30000,
  allScriptsTimeout: 30000,
  jasmineNodeOpts: { defaultTimeoutInterval: 30000 },

  beforeLaunch: async () => {
    console.log('Starting local http server');
    server = httpServer.createServer({
      root: `${__dirname}/../../examples`,
    });
    const listen = util.promisify(server.listen).bind(server);
    await listen(PORT, '0.0.0.0');

    console.log('Connecting local BrowserStack');
    bsLocal = new browserstack.Local();
    const start = util.promisify(bsLocal.start).bind(bsLocal);
    await start({ key: exports.config.browserstackKey });

    console.log('Connected. Now testing...');
  },

  afterLaunch: async () => {
    server.close();
    const stop = util.promisify(bsLocal.stop).bind(bsLocal);
    await stop();
  },

  onPrepare: () => {
    browser.ignoreSynchronization = true;
  },
};
