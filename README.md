# casdoor-react-native-sdk

[![NPM version][npm-image]][npm-url]
[![NPM download][download-image]][download-url]
[![codebeat badge](https://codebeat.co/badges/6f2ad052-7fc8-42e1-b40f-0ca2648530c2)](https://codebeat.co/projects/github-com-casdoor-casdoor-react-native-sdk-master)
[![GitHub Actions](https://github.com/casdoor/casdoor-react-native-sdk/actions/workflows/release.yml/badge.svg)](https://github.com/casdoor/casdoor-react-native-sdk/actions/workflows/release.yml)
[![GitHub Actions](https://github.com/casdoor/casdoor-react-native-sdk/actions/workflows/build.yml/badge.svg)](https://github.com/casdoor/casdoor-react-native-sdk/actions/workflows/build.yml)
[![Coverage Status](https://codecov.io/gh/casdoor/casdoor-react-native-sdk/branch/master/graph/badge.svg)](https://codecov.io/gh/casdoor/casdoor-react-native-sdk)
[![Release](https://img.shields.io/github/release/casdoor/casdoor-react-native-sdk.svg)](https://github.com/casdoor/casdoor-react-native-sdk/releases/latest)
[![Discord](https://img.shields.io/discord/1022748306096537660?logo=discord&label=discord&color=5865F2)](https://discord.gg/5rPsrAzK7S)

[npm-image]: https://img.shields.io/npm/v/casdoor-react-native-sdk.svg?style=flat-square

[npm-url]: https://npmjs.com/package/casdoor-react-native-sdk

[download-image]: https://img.shields.io/npm/dm/casdoor-react-native-sdk.svg?style=flat-square

[download-url]: https://npmjs.com/package/casdoor-react-native-sdk
This is Casdoor's SDK for react-native will allow you to easily connect your application to the Casdoor authentication system
without having to implement it from scratch.

Casdoor SDK is very simple to use. We will show you the steps below.

## Usage in NPM environment

### Installation

~~~shell script
# NPM
npm i casdoor-react-native-sdk

# Yarn
yarn add casdoor-react-native-sdk
~~~

### Init SDK for Web

For web environments, the SDK works as before with relative or absolute paths:

```typescript
import SDK from 'casdoor-react-native-sdk'

const sdkConfig = {
  serverUrl: 'https://door.casdoor.com',
  clientId: 'b800a86702dd4d29ec4d',
  appName: 'app-example',
  organizationName: 'casbin',
  redirectPath: '/callback', // Can use relative path in web
  signinPath: '/api/signin',
};
const sdk = new SDK(sdkConfig)
```

### Init SDK for React Native / Expo

For React Native and Expo environments, you must provide an absolute URI for `redirectPath`:

```typescript
import SDK from 'casdoor-react-native-sdk'

const sdkConfig = {
  serverUrl: 'https://door.casdoor.com',
  clientId: 'b800a86702dd4d29ec4d',
  appName: 'app-example',
  organizationName: 'casbin',
  redirectPath: 'myapp://callback', // Must be absolute URI with custom scheme
  signinPath: '/api/signin',
};
const sdk = new SDK(sdkConfig)
```

#### Using with Expo AuthSession

For Expo projects, you can use `AuthSession.makeRedirectUri()` to generate the redirect URI:

```typescript
import * as AuthSession from 'expo-auth-session';
import SDK from 'casdoor-react-native-sdk'

const redirectUri = AuthSession.makeRedirectUri({
  scheme: 'myapp',
  path: 'callback'
});

const sdkConfig = {
  serverUrl: 'https://door.casdoor.com',
  clientId: 'b800a86702dd4d29ec4d',
  appName: 'app-example',
  organizationName: 'casbin',
  redirectPath: redirectUri, // Use the generated redirect URI
  signinPath: '/api/signin',
};
const sdk = new SDK(sdkConfig)
```

Don't forget to add the custom scheme to your `app.json`:

```json
{
  "expo": {
    "scheme": "myapp"
  }
}
```

### Init SDK

Initialization requires 7 parameters, which are all string type:

| Name (in order)  | Must | Description                                         |
| ---------------- | ---- | --------------------------------------------------- |
| serverUrl  | Yes  | your Casdoor server URL               |
| clientId         | Yes  | the Client ID of your Casdoor application|
| appName           | Yes  | the name of your Casdoor application |
| organizationName     | Yes  | the name of the Casdoor organization connected with your Casdoor application                    |
| redirectPath     | No  | the path of the redirect URL for your Casdoor application, will be `/callback` if not provided              |
| signinPath     | No  | the path of the signin URL for your Casdoor application, will be `/api/signin` if not provided              |

```typescript
import SDK from 'casdoor-react-native-sdk'

const sdkConfig = {
  serverUrl: 'https://door.casdoor.com',
  clientId: 'b800a86702dd4d29ec4d',
  appName: 'app-example',
  organizationName: 'casbin',
  redirectPath: 'http://localhost:5000/callback',
  signinPath: '/api/signin',
};
const sdk = new SDK(sdkConfig)
// call sdk to handle
```

## Usage in vanilla Javascript

### Import and init SDK

Initialization parameters are consistent with the previous node.js section:

```javascript
<!--init the SDK-->
  import SDK from 'casdoor-react-native-sdk'
  const sdkConfig = {
    serverUrl: 'https://door.casdoor.com',
    clientId: 'b800a86702dd4d29ec4d',
    appName: 'app-example',
    organizationName: 'casbin',
    redirectPath: 'http://localhost:5000/callback',
    signinPath: '/api/signin',
  };
  const sdk = new SDK(sdkConfig)
```

### Call functions in SDK

```javascript
  // call sdk to handle
  sdk.getSignupUrl();
```

## API reference interface

#### Get sign up url

```typescript
getSignupUrl()
```

Return the casdoor url that navigates to the registration screen

#### Get sign in url

```typescript
getSigninUrl()
```

Return the casdoor url that navigates to the login screen

#### Get user profile page url

```typescript
getUserProfileUrl(userName, account)
```

Return the url to navigate to a specific user's casdoor personal page

#### Get my profile page url

```typescript
getMyProfileUrl(account)
```

#### getAccessToken

```typescript
getAccessToken(redirectUrl); // http://localhost:5000/callback?code=b75bc5c5ac65ffa516e5&state=gjmfdgqf498
```

Handle the callback url from casdoor, call the back-end api to complete the login process

#### Determine whether silent sign-in is being used

```typescript
isSilentSigninRequested()
```

We usually use this method to determine if silent login is being used. By default, if the silentSignin parameter is included in the URL and equals one, this method will return true. Of course, you can also use any method you prefer.

#### silentSignin

````typescript
silentSignin(onSuccess, onFailure)
````

First, let's explain the two parameters of this method, which are the callback methods for successful and failed login. Next, I will describe the execution process of this method. We will create a hidden "iframe" element to redirect to the login page for authentication, thereby achieving the effect of silent sign-in.

**Note:** `silentSignin` only works in web environments and is not supported in React Native/Expo. The method will call the `onFailure` callback with an appropriate error message if called in a React Native environment. For React Native apps, use the standard signin flow with deep linking.

#### JwtDecode

````typescript
JwtDecode(jwtToken)
````


## Expo / React Native Setup Guide

### Prerequisites

1. **Configure your Casdoor application** to accept your custom scheme redirect URI (e.g., `myapp://callback`)
2. **Add custom scheme to app.json** (Expo) or configure deep linking in your React Native app

### Step-by-Step Setup for Expo

#### 1. Install dependencies

```bash
npm install casdoor-react-native-sdk expo-auth-session expo-web-browser
```

#### 2. Configure app.json

Add your custom URL scheme to `app.json`:

```json
{
  "expo": {
    "scheme": "myapp",
    "name": "My App",
    ...
  }
}
```

#### 3. Initialize the SDK

```typescript
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import SDK from 'casdoor-react-native-sdk';

// This is required for Expo to properly handle the redirect
WebBrowser.maybeCompleteAuthSession();

const redirectUri = AuthSession.makeRedirectUri({
  scheme: 'myapp',
  path: 'callback'
});

const sdk = new SDK({
  serverUrl: 'https://door.casdoor.com',
  clientId: 'your-client-id',
  appName: 'your-app-name',
  organizationName: 'your-org-name',
  redirectPath: redirectUri,
});
```

#### 4. Implement login flow

```typescript
import { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

export default function LoginScreen() {
  const [token, setToken] = useState(null);

  const handleLogin = async () => {
    try {
      // Get the sign-in URL from SDK
      const signinUrl = await sdk.getSigninUrl();
      
      // Open the browser for authentication
      const result = await WebBrowser.openAuthSessionAsync(
        signinUrl,
        redirectUri
      );

      if (result.type === 'success') {
        // Extract the code from the redirect URL
        const token = await sdk.getAccessToken(result.url);
        setToken(token);
        
        // Optionally decode the token to get user info
        const userInfo = sdk.JwtDecode(token);
        console.log('User info:', userInfo);
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <View>
      <Button title="Login with Casdoor" onPress={handleLogin} />
      {token && <Text>Logged in! Token: {token.substring(0, 20)}...</Text>}
    </View>
  );
}
```

### Step-by-Step Setup for React Native (non-Expo)

For bare React Native apps, you'll need to:

1. **Configure deep linking** following the [React Native deep linking guide](https://reactnative.dev/docs/linking)
2. **Set up URL schemes** for iOS (in `Info.plist`) and Android (in `AndroidManifest.xml`)
3. **Use a library** like `react-native-inappbrowser-reborn` or React Navigation's linking configuration
4. **Initialize the SDK** with your custom scheme redirect URI (e.g., `myapp://callback`)

### Important Notes for React Native/Expo

- **Silent Sign-in**: The `silentSignin()` method is not supported in React Native/Expo as it relies on iframes which are not available. Use the standard authentication flow instead.
- **Redirect URI**: Always use absolute URIs with a custom scheme (e.g., `myapp://callback`) for the `redirectPath` configuration.
- **Deep Linking**: Ensure your app is properly configured to handle deep links with your custom scheme.
- **Testing**: Use Expo Go or a development build to test authentication flows. Custom schemes may not work properly in Expo Go without additional configuration.

## More examples

To see how to use SDK, you can refer to [casdoor-react-native-example](https://github.com/casdoor/casdoor-react-native-example).
