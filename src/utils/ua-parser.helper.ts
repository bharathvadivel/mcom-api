import { UAParser } from 'ua-parser-js';

export interface ParsedUserAgent {
  deviceName: string;
  browser: string;
  os: string;
  deviceType: string;
}

export function parseUserAgent(userAgent: string): ParsedUserAgent {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  // Build a meaningful device name
  const browser = result.browser.name || 'Unknown Browser';
  const browserVersion = result.browser.version ? ` ${result.browser.version.split('.')[0]}` : '';
  const os = result.os.name || 'Unknown OS';
  const osVersion = result.os.version ? ` ${result.os.version}` : '';
  const deviceModel = result.device.model || '';
  const deviceVendor = result.device.vendor || '';

  let deviceName = '';
  
  if (deviceModel && deviceVendor) {
    // Mobile/tablet device
    deviceName = `${deviceVendor} ${deviceModel}`;
  } else {
    // Desktop/laptop
    deviceName = `${browser}${browserVersion} on ${os}${osVersion}`;
  }

  return {
    deviceName: deviceName.trim(),
    browser: `${browser}${browserVersion}`.trim(),
    os: `${os}${osVersion}`.trim(),
    deviceType: result.device.type || 'desktop'
  };
}
