export interface SdkConfig {
    serverUrl: string;
    clientId: string;
    appName: string;
    organizationName: string;
    redirectPath?: string;
    signinPath?: string;
}
export interface Account {
    organization: string;
    username: string;
    type: string;
    name: string;
    avatar: string;
    email: string;
    phone: string;
    affiliation: string;
    tag: string;
    language: string;
    score: number;
    isAdmin: boolean;
    accessToken: string;
}
declare class Sdk {
    private config;
    private pkce;
    constructor(config: SdkConfig);
    getSignupUrl(enablePassword?: boolean): Promise<string>;
    getOrSaveState(): Promise<string>;
    clearState(): void;
    getSigninUrl(): Promise<string>;
    getUserProfileUrl(userName: string, account: Account): string;
    getMyProfileUrl(account: Account, returnUrl?: String): string;
    JwtDecode(token: string): unknown;
    getAccessToken(redirectUrl: string): Promise<any>;
    isSilentSigninRequested(): boolean;
    silentSignin(onSuccess: (message: any) => void, onFailure: (message: any) => void): void;
}
export default Sdk;
