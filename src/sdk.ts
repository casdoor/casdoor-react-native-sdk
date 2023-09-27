// Copyright 2021 The casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';
import pkceChallenge from 'react-native-pkce-challenge'

export interface SdkConfig {
    serverUrl: string, // your Casdoor server URL, e.g., 'https://door.casdoor.com' for the official demo site
    clientId: string, // the Client ID of your Casdoor application, e.g., 'b800a86702dd4d29ec4d'
    appName: string, // the name of your Casdoor application, e.g., 'app-example'
    organizationName: string // the name of the Casdoor organization connected with your Casdoor application, e.g., 'casbin'
    redirectPath?: string // the path of the redirect URL for your Casdoor application, will be 'http://localhost:5000/callback' if not provided
    signinPath?: string // the path of the signin URL for your Casdoor applcation, will be '/api/signin' if not provided
}

// reference: https://github.com/casdoor/casdoor-go-sdk/blob/90fcd5646ec63d733472c5e7ce526f3447f99f1f/auth/jwt.go#L19-L32
export interface Account {
    organization: string,
    username: string,
    type: string,
    name: string,
    avatar: string,
    email: string,
    phone: string,
    affiliation: string,
    tag: string,
    language: string,
    score: number,
    isAdmin: boolean,
    accessToken: string
}

class Sdk {
    private config: SdkConfig
    private pkce = pkceChallenge();

    constructor(config: SdkConfig) {
        this.config = config
        if (config.redirectPath === undefined || config.redirectPath === null) {
            this.config.redirectPath = '/callback';
        }
    }

    public async getSignupUrl(enablePassword: boolean = true): Promise<string> {
        const signinUrl = await this.getSigninUrl();
        if (enablePassword) {
            AsyncStorage.setItem('signinUrl', signinUrl);
            return `${this.config.serverUrl.trim()}/signup/${this.config.appName}`;
        } else {
            return signinUrl.replace('/login/oauth/authorize', '/signup/oauth/authorize');
        }
    }

    async getOrSaveState(): Promise<string> {
        const state = await AsyncStorage.getItem('casdoor-state');
        if (state !== null) {
            return state;
        } else {
            const state = Math.random().toString(36).slice(2);
            AsyncStorage.setItem('casdoor-state', state);
            return state;
        }
    }

    clearState() {
        AsyncStorage.removeItem('casdoor-state');
    }

    public async getSigninUrl(): Promise<string> {
        const redirectUri = this.config.redirectPath && this.config.redirectPath.includes('://') ? this.config.redirectPath : `${window.location.origin}${this.config.redirectPath}`;
        const scope = 'read';
        const state = await this.getOrSaveState();
        return `${this.config.serverUrl.trim()}/login/oauth/authorize?client_id=${this.config.clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}&code_challenge=${this.pkce.codeChallenge}&code_challenge_method=S256`;
    }

    public getUserProfileUrl(userName: string, account: Account): string {
        let param = '';
        if (account !== undefined && account !== null) {
            param = `?access_token=${account.accessToken}`;
        }
        return `${this.config.serverUrl.trim()}/users/${this.config.organizationName}/${userName}${param}`;
    }

    public getMyProfileUrl(account: Account, returnUrl: String = ''): string {
        let params = '';
        if (account !== undefined && account !== null) {
            params = `?access_token=${account.accessToken}`;
            if (returnUrl !== '') {
                params += `&returnUrl=${returnUrl}`;
            }
        } else if (returnUrl !== '') {
            params = `?returnUrl=${returnUrl}`;
        }
        return `${this.config.serverUrl.trim()}/account${params}`;
    }

    public JwtDecode(token: string) {
        return jwtDecode(token);
    }

    public async getAccessToken(redirectUrl: string): Promise<any> {
        // @ts-ignore
        if (redirectUrl.startsWith(this.config.redirectPath)) {
            const codeStartIndex = redirectUrl.indexOf('code=') + 5;
            const codeEndIndex = redirectUrl.indexOf('&', codeStartIndex);
            const code = redirectUrl.substring(codeStartIndex, codeEndIndex);
            const stateStartIndex = redirectUrl.indexOf('state=') + 6;
            const state = redirectUrl.substring(stateStartIndex);
            await AsyncStorage.setItem('casdoor-state', state);
            try {
                const response = await fetch(`${this.config.serverUrl.trim()}/api/login/oauth/access_token`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    // @ts-ignore
                    body: `client_id=${this.config.clientId}&grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(this.config.redirectPath)}&code_verifier=${this.pkce.codeVerifier}`,
                    credentials: 'include',
                });
                if (response.ok) {
                    const responseData = await response.json();
                    const token = responseData.access_token;
                    return token;
                } else {
                    console.error('Error during AccessToken Request:', response);
                }
            } catch (error) {
                console.error('Error during Signin Request:', error);
            }
        }
    }

    public isSilentSigninRequested(): boolean{
        const params = new URLSearchParams(window.location.search);
        return params.get('silentSignin') === '1';
    }

    public silentSignin(onSuccess: (message: any) => void, onFailure: (message: any) => void) {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = `${this.getSigninUrl()}&silentSignin=1`;
        const handleMessage = (event: MessageEvent) => {
            if (window !== window.parent) {
                return null;
            }

            const message = event.data;
            if (message.tag !== 'Casdoor' || message.type !== 'SilentSignin') {
                return;
            }
            if (message.data === 'success') {
                onSuccess(message);
            } else {
                onFailure(message);
            }
        };
        window.addEventListener('message', handleMessage);
        document.body.appendChild(iframe);
    }

}

export default Sdk;
