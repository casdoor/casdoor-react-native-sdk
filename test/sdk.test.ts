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

describe('signin', () => {
  const expoConfig = {
    ...sdkConfig,
    redirectPath: 'exp://192.168.1.2:8081/--/callback',
  };

  beforeEach(async () => {
    await AsyncStorage.clear();
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({access_token: 'test-token'}),
    });
  });

  it('exchanges the code returned by the auth session for a token', async () => {
    const sdk = new Sdk(expoConfig);
    const openAuthSession = jest.fn().mockResolvedValue({
      type: 'success',
      url: `${expoConfig.redirectPath}?state=abc&code=test-code`,
    });

    const token = await sdk.signin(openAuthSession);

    expect(token).toEqual('test-token');
    expect(openAuthSession.mock.calls[0][0]).toContain(`redirect_uri=${encodeURIComponent(expoConfig.redirectPath)}`);
    expect(openAuthSession.mock.calls[0][1]).toEqual(expoConfig.redirectPath);
    const body = (global as any).fetch.mock.calls[0][1].body;
    expect(body).toContain('code=test-code&');
    expect(body).toContain(`redirect_uri=${encodeURIComponent(expoConfig.redirectPath)}`);
  });

  it('returns undefined when the user cancels', async () => {
    const sdk = new Sdk(expoConfig);

    const token = await sdk.signin(async () => ({type: 'cancel'}));

    expect(token).toBeUndefined();
    expect((global as any).fetch).not.toHaveBeenCalled();
  });
});

describe('PKCE across a page redirect', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({access_token: 'test-token'}),
    });
  });

  it('uses the code verifier saved before the redirect in a new Sdk instance', async () => {
    const signinUrl = await new Sdk(sdkConfig).getSigninUrl();
    const pkce = JSON.parse((await AsyncStorage.getItem('casdoor-pkce'))!);
    expect(signinUrl).toContain(`code_challenge=${pkce.code_challenge}`);

    // the page is reloaded after the redirect back from Casdoor, so a new Sdk instance handles the callback
    const token = await new Sdk(sdkConfig).getAccessToken(`${sdkConfig.redirectPath}?code=test-code&state=abc`);

    expect(token).toEqual('test-token');
    expect((global as any).fetch.mock.calls[0][1].body).toContain(`code_verifier=${pkce.code_verifier}`);
    expect(await AsyncStorage.getItem('casdoor-pkce')).toBeNull();
  });

  it('uses a new code verifier for the next signin', async () => {
    const sdk = new Sdk(sdkConfig);
    const firstUrl = await sdk.getSigninUrl();
    await sdk.getAccessToken(`${sdkConfig.redirectPath}?code=test-code&state=abc`);

    const secondUrl = await sdk.getSigninUrl();

    const getChallenge = (url: string) => url.split('code_challenge=')[1].split('&')[0];
    expect(getChallenge(secondUrl)).not.toEqual(getChallenge(firstUrl));
  });
});
