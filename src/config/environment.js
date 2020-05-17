/**
 * 环境配置
 *
 * @type {string}
 */

let baseUrl = 'http://127.0.0.1';

if (process.env.NODE_ENV === "development") {
    baseUrl = "http://127.0.0.1:8080";
} else if (process.env.NODE_ENV === "test") {
    baseUrl = "http://120.24.243.237:8080";
} else if (process.env.NODE_ENV === "production") {
    baseUrl = "http://120.24.243.237:8080";
}

let isProduction = false;

if (process.env.NODE_ENV === "production") {
    isProduction = true;
}

export {
    baseUrl,
    isProduction
}
