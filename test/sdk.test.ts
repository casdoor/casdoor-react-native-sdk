import Sdk from '../src';
import AsyncStorage from '@react-native-async-storage/async-storage';

const sdkConfig = {
  serverUrl: 'https://door.casdoor.com',
  clientId: 'b800a86702dd4d29ec4d',
  appName: 'app-example',
  organizationName: 'casbin',
  redirectPath: 'http://localhost:5000/callback',
  signinPath: '/api/signin',
};

describe('sdk constructor', () => {
  it('with full configs', () => {
    const sdk = new Sdk(sdkConfig);

    const instanceConfig = sdk['config'];
    expect(instanceConfig.serverUrl).toEqual(sdkConfig.serverUrl);
    expect(instanceConfig.clientId).toEqual(sdkConfig.clientId);
    expect(instanceConfig.appName).toEqual(sdkConfig.appName);
    expect(instanceConfig.organizationName).toEqual(sdkConfig.organizationName);
    expect(instanceConfig.redirectPath).toEqual(sdkConfig.redirectPath);
    expect(instanceConfig.signinPath).toEqual(sdkConfig.signinPath);
  });

  it('config without redirectPath', () => {
    let config = {
      ...sdkConfig,
      redirectPath: undefined,
    };
    const sdk = new Sdk(sdkConfig);

    const instanceConfig = sdk['config'];
    expect(instanceConfig.redirectPath).toEqual('http://localhost:5000/callback');
  });
});

describe('getSigninUrl', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('redirectPath with relative path', async () => {
    const sdk = new Sdk(sdkConfig);

    const url = await sdk.getSigninUrl();
    const expectedRedirectUri = `redirect_uri=${encodeURIComponent('http://localhost:5000/callback')}`;

    expect(url).toContain(expectedRedirectUri);
  });

  it('redirectPath with fully path', async () => {
    const sdk = new Sdk(sdkConfig);

    const url = await sdk.getSigninUrl();

    expect(url).toContain(`redirect_uri=${encodeURIComponent(sdkConfig.redirectPath)}`);
  });

  it('with fixed state', async () => {
    const state = 'test-state';
    await AsyncStorage.setItem('casdoor-state', state);
    const sdk = new Sdk(sdkConfig);

    const url = await sdk.getSigninUrl();

    expect(url).toContain(`state=${state}`);
  });

  it('with random state', async () => {
    const sdk = new Sdk(sdkConfig);

    const url = await sdk.getSigninUrl();
    const state = await AsyncStorage.getItem('casdoor-state');

    expect(url).toContain(`state=${state}`);
  });
});
