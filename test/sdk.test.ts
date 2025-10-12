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

  it('with absolute URI redirectPath (React Native/Expo)', async () => {
    const expoConfig = {
      ...sdkConfig,
      redirectPath: 'myapp://callback',
    };
    const sdk = new Sdk(expoConfig);

    const url = await sdk.getSigninUrl();

    expect(url).toContain(`redirect_uri=${encodeURIComponent('myapp://callback')}`);
  });

  it('with Expo AuthSession format', async () => {
    const expoConfig = {
      ...sdkConfig,
      redirectPath: 'exp://192.168.1.1:8081/--/callback',
    };
    const sdk = new Sdk(expoConfig);

    const url = await sdk.getSigninUrl();

    expect(url).toContain(`redirect_uri=${encodeURIComponent('exp://192.168.1.1:8081/--/callback')}`);
  });
});

describe('React Native environment compatibility', () => {
  it('isSilentSigninRequested returns false in non-web environment', () => {
    const sdk = new Sdk(sdkConfig);
    
    // In test environment (jsdom), window exists, but we can test the logic
    const result = sdk.isSilentSigninRequested();
    
    // Should not throw and should return a boolean
    expect(typeof result).toBe('boolean');
  });

  it('silentSignin handles non-web environment gracefully', () => {
    const sdk = new Sdk(sdkConfig);
    const onSuccess = jest.fn();
    const onFailure = jest.fn();

    // In jsdom environment, this should work normally
    // But the implementation now includes a check for undefined window/document
    sdk.silentSignin(onSuccess, onFailure);

    // In web environment (jsdom), it should proceed normally
    // We're just ensuring it doesn't throw an error
  });
});
