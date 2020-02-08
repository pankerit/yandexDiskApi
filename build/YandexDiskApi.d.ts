declare type video = {
    dimesnion: string;
    size: {
        width: number;
        height: number;
    } | {};
    url: string;
};
declare type resource = {
    name: string;
    path: string;
    type: 'dir' | 'file';
    size?: number;
    ext?: string;
    mediatype?: string;
    duration?: number;
    videos?: video[];
    downloadLink?: string;
};
declare type action = 'fetch-list' | 'get-dir-size' | 'get-video-streams' | 'download-url';
export declare class YandexDiskApi {
    private url;
    private sk;
    private uid;
    private hash;
    private currPath;
    private resources;
    constructor(url: string);
    load(): Promise<void>;
    parceResources(): Promise<resource[]>;
    private parceResource;
    fetch(path: string, action: action): Promise<any>;
    static load(url: string): Promise<YandexDiskApi>;
}
export {};
