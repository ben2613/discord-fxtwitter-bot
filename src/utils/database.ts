import Keyv = require("keyv");

export default class Database {

    SEPARATOR: string;

    kv: Keyv;
    cache: Map<string, unknown>;

    constructor(connstr: string | undefined) {
        this.SEPARATOR = '-_-';
        this.kv = new Keyv(connstr);
        this.cache = new Map<string, string>();
    }

    set(guildId: string, k: string, v: unknown): Promise<true> {
        let key = guildId + this.SEPARATOR + k;
        return this._set(key, v);
    }

    get(guildId: string, k: string): Promise<unknown | undefined> {
        let key = guildId + this.SEPARATOR + k;
        return this._get(key);
    }

    setGlobal(k: string, v: unknown): Promise<true> {
        return this._set(k, v);
    }

    getGlobal(k: string): Promise<unknown | undefined> {
        return this._get(k);
    }

    private async _set(k: string, v: unknown): Promise<true> {
        this.cache.set(k, v);
        return await this.kv.set(k, v);
    }

    private async _get(k: string): Promise<unknown | undefined> {
        if (this.cache.has(k)) {
            return this.cache.get(k);
        } else {
            let v = await this.kv.get(k);
            if (v === undefined) return undefined
            this.cache.set(k, v);
            return v;
        }
    }

    async clear(): Promise<void> {
        return this.kv.clear();
    }
}

