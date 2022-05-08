import Keyv = require("keyv");

export default class Database {

    SEPARATOR: string;

    kv: Keyv<string, Record<string, unknown>>;

    constructor(connstr: string | undefined) {
        this.SEPARATOR = '-_-'
        this.kv = new Keyv<string, Record<string, unknown>>(connstr)
    }

    set(guildId: string, k: string, v: string): Promise<true> {
        return this.kv.set(guildId + this.SEPARATOR + k, v)
    }

    get(guildId: string, k: string): Promise<string | undefined> {
        return this.kv.get(guildId + this.SEPARATOR + k)
    }

    setGlobal(k: string, v: string): Promise<true> {
        return this.kv.set(k, v)
    }

    getGlobal(k: string): Promise<string | undefined> {
        return this.kv.get(k)
    }

    clear(): Promise<void> {
        return this.kv.clear()
    }
}

