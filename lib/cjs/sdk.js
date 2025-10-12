"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const async_storage_1 = require("@react-native-async-storage/async-storage");
const jwt_decode_1 = require("jwt-decode");
const pkce_challenge_1 = require("pkce-challenge");
class Sdk {
    constructor(config) {
        this.pkce = (0, pkce_challenge_1.default)();
        this.config = config;
        if (config.redirectPath === undefined || config.redirectPath === null) {
            this.config.redirectPath = '/callback';
        }
    }
    async getSignupUrl(enablePassword = true) {
        const signinUrl = await this.getSigninUrl();
        if (enablePassword) {
            async_storage_1.default.setItem('signinUrl', signinUrl);
            return `${this.config.serverUrl.trim()}/signup/${this.config.appName}`;
        }
        else {
            return signinUrl.replace('/login/oauth/authorize', '/signup/oauth/authorize');
        }
    }
    async getOrSaveState() {
        const state = await async_storage_1.default.getItem('casdoor-state');
        if (state !== null) {
            return state;
        }
        else {
            const state = Math.random().toString(36).slice(2);
            async_storage_1.default.setItem('casdoor-state', state);
            return state;
        }
    }
    clearState() {
        async_storage_1.default.removeItem('casdoor-state');
    }
    async getSigninUrl() {
        const redirectUri = this.config.redirectPath && this.config.redirectPath.includes('://') ? this.config.redirectPath : `${window.location.origin}${this.config.redirectPath}`;
        const scope = 'read';
        const state = await this.getOrSaveState();
        return `${this.config.serverUrl.trim()}/login/oauth/authorize?client_id=${this.config.clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}&code_challenge=${this.pkce.code_challenge}&code_challenge_method=S256`;
    }
    getUserProfileUrl(userName, account) {
        let param = '';
        if (account !== undefined && account !== null) {
            param = `?access_token=${account.accessToken}`;
        }
        return `${this.config.serverUrl.trim()}/users/${this.config.organizationName}/${userName}${param}`;
    }
    getMyProfileUrl(account, returnUrl = '') {
        let params = '';
        if (account !== undefined && account !== null) {
            params = `?access_token=${account.accessToken}`;
            if (returnUrl !== '') {
                params += `&returnUrl=${returnUrl}`;
            }
        }
        else if (returnUrl !== '') {
            params = `?returnUrl=${returnUrl}`;
        }
        return `${this.config.serverUrl.trim()}/account${params}`;
    }
    JwtDecode(token) {
        return (0, jwt_decode_1.default)(token);
    }
    async getAccessToken(redirectUrl) {
        // @ts-ignore
        if (redirectUrl.startsWith(this.config.redirectPath)) {
            const codeStartIndex = redirectUrl.indexOf('code=') + 5;
            const codeEndIndex = redirectUrl.indexOf('&', codeStartIndex);
            const code = redirectUrl.substring(codeStartIndex, codeEndIndex);
            const stateStartIndex = redirectUrl.indexOf('state=') + 6;
            const state = redirectUrl.substring(stateStartIndex);
            await async_storage_1.default.setItem('casdoor-state', state);
            try {
                const response = await fetch(`${this.config.serverUrl.trim()}/api/login/oauth/access_token`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    // @ts-ignore
                    body: `client_id=${this.config.clientId}&grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(this.config.redirectPath)}&code_verifier=${this.pkce.code_verifier}`,
                    credentials: 'include',
                });
                if (response.ok) {
                    const responseData = await response.json();
                    const token = responseData.access_token;
                    return token;
                }
                else {
                    console.error('Error during AccessToken Request:', response);
                }
            }
            catch (error) {
                console.error('Error during Signin Request:', error);
            }
        }
    }
    isSilentSigninRequested() {
        const params = new URLSearchParams(window.location.search);
        return params.get('silentSignin') === '1';
    }
    silentSignin(onSuccess, onFailure) {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = `${this.getSigninUrl()}&silentSignin=1`;
        const handleMessage = (event) => {
            if (window !== window.parent) {
                return null;
            }
            const message = event.data;
            if (message.tag !== 'Casdoor' || message.type !== 'SilentSignin') {
                return;
            }
            if (message.data === 'success') {
                onSuccess(message);
            }
            else {
                onFailure(message);
            }
        };
        window.addEventListener('message', handleMessage);
        document.body.appendChild(iframe);
    }
}
exports.default = Sdk;
