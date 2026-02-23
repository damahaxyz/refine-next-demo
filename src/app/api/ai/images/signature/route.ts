import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();
        console.log("[AIDC Signature Payload Received]:", JSON.stringify(payload, null, 2));
        const { api, data: params = {} } = payload;

        const appKey = process.env.AIDGE_APP_KEY || process.env.AIDGE_API_KEY;
        const appSecret = process.env.AIDGE_APP_SECRET || process.env.AIDGE_API_KEY;

        if (!appKey || !appSecret) {
            return NextResponse.json({ success: false, message: "AIDGE API credentials not configured." }, { status: 500 });
        }

        const timestamp = Date.now();
        const signMethod = "sha256";

        // Add required parameters for signing
        const signParams: Record<string, string> = {
            ...params,
            app_key: appKey,
            sign_method: signMethod,
            timestamp: timestamp.toString()
        };

        // Step 1: Sort keys
        const keys = Object.keys(signParams).sort();

        // Step 2 & 3: Concatenate API name and all parameters
        let query = typeof api === 'string' ? api : "";
        for (const key of keys) {
            const value = signParams[key];
            if (key && value) {
                query += `${key}${value}`;
            }
        }

        // Step 4 & 5: HMAC-SHA256 and convert to uppercase Hex
        const signature = crypto.createHmac('sha256', appSecret).update(query, 'utf8').digest('hex').toUpperCase();

        return NextResponse.json({
            code: 200,
            message: "",
            requestId: crypto.randomUUID(),
            data: {
                // The SDK expects these fields for authentication
                appKey: appKey,
                targetAppKey: appKey,
                signMethod: "SHA256",
                timestamp: timestamp,
                signStr: signature,
            },
            result: null
        });
    } catch (e: any) {
        return NextResponse.json({ success: false, message: e.message || "Something went wrong" }, { status: 500 });
    }
}
/*
{
                "data": {
                    "usage": 1,
                    "result": {
                        "data": {
                            "message": [],
                            "usageMap": "{\"usage\":1}",
                            "structData": {
                                "message": [
                                    {
                                        "src_image": "https://img.alicdn.com/imgextra/i1/3204128644/O1CN01eKljEs2Dj0hLJhbmd_!!3204128644.jpg",
                                        "result_list": [
                                            {
                                                "fileUrl": "https://aib-image.oss-ap-southeast-1.aliyuncs.com/tufan%2F83583c2e-1016-11f1-9e1f-00163e0d0006.jpg?OSSAccessKeyId=LTAI5tSEGjGp5wixZgHLc3bV&Expires=4988454430&Signature=XZGjOGKN6T7Epv3bIz6h9qzpgnU%3D",
                                                "language": "en"
                                            }
                                        ]
                                    }
                                ],
                                "usageMap": "{\"usage\": 1}"
                            }
                        },
                        "success": true,
                        "requestId": "213d7a8f17717824194952987e42d5"
                    }
                },
                "resCode": 200,
                "resMessage": "success",
                "imageResultList": [
                    {
                        "src_image": "https://img.alicdn.com/imgextra/i1/3204128644/O1CN01eKljEs2Dj0hLJhbmd_!!3204128644.jpg",
                        "result_list": [
                            {
                                "fileUrl": "https://aib-image.oss-ap-southeast-1.aliyuncs.com/tufan%2F83583c2e-1016-11f1-9e1f-00163e0d0006.jpg?OSSAccessKeyId=LTAI5tSEGjGp5wixZgHLc3bV&Expires=4988454430&Signature=XZGjOGKN6T7Epv3bIz6h9qzpgnU%3D",
                                "language": "en"
                            }
                        ]
                    }
                ],
                "code": "0",
                "request_id": "2151f8e017717824196451804",
                "_trace_id_": "213d7a8f17717824194952987e42d5"
            }
                */