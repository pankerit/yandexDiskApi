"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const YandexDiskApi_1 = require("./YandexDiskApi");
const main = async () => {
    const yandexDiskApi = await YandexDiskApi_1.YandexDiskApi.load('https://yadi.sk/d/lq-M1CkPXB6CSA/123/123');
    console.time('ms');
    const resources = await yandexDiskApi.parceResources();
    console.timeEnd('ms');
    console.log(JSON.stringify(resources, null, 2));
};
main();
//# sourceMappingURL=index.js.map