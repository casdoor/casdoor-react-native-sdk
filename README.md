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

### Init SDK

Initialization requires 7 parameters, which are all string type:

| Name (in order)  | Must | Description                                         |
| ---------------- | ---- | --------------------------------------------------- |
| serverUrl  | Yes  | your Casdoor server URL               |
| clientId         | Yes  | the Client ID of your Casdoor application|
|clientSecret|Yes|the Client Secret of your Casdoor application|
| appName           | Yes  | the name of your Casdoor application |
| organizationName     | Yes  | the name of the Casdoor organization connected with your Casdoor application                    |
| redirectPath     | No  | the path of the redirect URL for your Casdoor application, will be `/callback` if not provided              |
| signinPath     | No  | the path of the signin URL for your Casdoor application, will be `/api/signin` if not provided              |

```typescript
import SDK from 'casdoor-react-native-sdk'

const sdkConfig = {
  serverUrl: 'https://door.casdoor.com',
  clientId: 'b800a86702dd4d29ec4d',
  clientSecret: '1219843a8db4695155699be3a67f10796f2ec1d5',
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
    clientSecret: '1219843a8db4695155699be3a67f10796f2ec1d5',
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

#### JwtDecode

````typescript
JwtDecode(jwtToken)
````


## More examples

To see how to use SDK, you can refer to [casdoor-react-native-example](https://github.com/casdoor/casdoor-react-native-example).
