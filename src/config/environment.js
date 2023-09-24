/**
 * 环境配置
 *
 * @type {string}
 */

let baseUrl = 'http://127.0.0.1';
let kuwoHttps = '';

if (process.env.NODE_ENV === "development") {
    baseUrl = "http://127.0.0.1:8888";
    kuwoHttps = "https://tx.alang.run/kuwo";
} else if (process.env.NODE_ENV === "test") {
    baseUrl = "http://127.0.0.1:8080";
    kuwoHttps = '';
} else if (process.env.NODE_ENV === "production") {
    baseUrl = "https://tx.alang.run/api";
    kuwoHttps = "https://tx.alang.run/kuwo";
}

let isProduction = false;

if (process.env.NODE_ENV === "production") {
    isProduction = true;
}

export {
    baseUrl,
    isProduction,
    kuwoHttps
}
