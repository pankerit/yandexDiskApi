"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
class YandexDiskApi {
    constructor(url) {
        this.url = url;
    }
    async load() {
        try {
            const response = await node_fetch_1.default(this.url).then(res => res.text());
            //@ts-ignore
            const json = JSON.parse(response.match(/<script type="application\/json" id="store-prefetch">(.+?)<\/script>/, 's')[1]);
            const { environment, resources } = json;
            this.sk = environment.sk;
            this.uid = environment.yandexuid;
            this.resources = resources;
            this.hash = resources[Object.keys(resources)[0]].hash;
        }
        catch (error) {
            console.error(error);
        }
    }
    async parceResources() {
        const keys = Object.keys(this.resources);
        keys.shift();
        const parcedResource = await Promise.all(
        // @ts-ignore
        keys.map((key) => this.parceResource(this.resources[key])));
        return parcedResource;
    }
    async parceResource(obj) {
        const payload = {
            name: obj.name,
            type: obj.type,
            path: obj.path,
        };
        if (obj.type !== 'dir') {
            payload.size = obj.meta.size;
            payload.ext = obj.meta.ext;
            payload.mediatype = obj.meta.mediatype;
            if (payload.mediatype === 'video') {
                const [videos, link] = await Promise.all([this.fetch(obj.path, 'get-video-streams'), this.fetch(obj.path, 'download-url')]);
                payload.videos = videos.videos;
                payload.downloadLink = link;
            }
            else if (payload.mediatype === 'text') {
                const res = await this.fetch(obj.path, 'download-url');
                payload.downloadLink = res;
            }
        }
        return payload;
    }
    async fetch(path, action) {
        try {
            const res = await node_fetch_1.default(`https://yadi.sk/public/api/${action}`, {
                method: 'POST',
                body: JSON.stringify({
                    hash: path,
                    sk: this.sk
                }),
                headers: {
                    'Content-Type': 'text/plain',
                    Cookie: `yandexuid=${this.uid}`
                }
            });
            if (res.status !== 200)
                throw new Error('fetch status !== 200');
            const response = await res.json();
            if (action === 'download-url')
                return node_fetch_1.default(response.data.url).then(res => res.url);
            return response.data;
        }
        catch (error) {
            console.error(error);
        }
    }
    static async load(url) {
        const yandexDiskApi = new YandexDiskApi(url);
        await yandexDiskApi.load();
        return yandexDiskApi;
    }
}
exports.YandexDiskApi = YandexDiskApi;
//# sourceMappingURL=YandexDiskApi.js.map