import crypto from "crypto";

export function getAidcApiUrl(apiPath: string) {
    const appKey = process.env.AIDGE_APP_KEY || process.env.AIDGE_API_KEY;
    const appSecret = process.env.AIDGE_APP_SECRET || process.env.AIDGE_API_KEY;

    if (!appKey || !appSecret) {
        throw new Error("API credentials (AIDGE_APP_KEY and AIDGE_APP_SECRET) are not fully configured in .env.");
    }

    const timestamp = Date.now().toString();
    const signString = `${appSecret}${timestamp}`;
    const signature = crypto.createHmac('sha256', appSecret).update(signString).digest('hex').toUpperCase();

    const baseUrl = "https://cn-api.aidc-ai.com/rest";
    const normalizedPath = apiPath.startsWith("/") ? apiPath : `/${apiPath}`;

    return `${baseUrl}${normalizedPath}?partner_id=aidge&sign_method=sha256&sign_ver=v2&app_key=${appKey}&timestamp=${timestamp}&sign=${signature}`;
}
