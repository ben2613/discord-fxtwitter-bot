const Keyv = require('keyv')

class Database {
    constructor(connstr) {
        this.SEPARATOR = '-_-'
        this.kv = new Keyv(connstr)
    }
    set(guildId, k, v) {
        return this.kv.set(guildId + this.SEPARATOR + k, v)
    }
    get(guildId, k) {
        return this.kv.get(guildId + this.SEPARATOR + k)
    }
    setGlobal(k, v) {
        return this.kv.set(k, v)
    }
    getGlobal(k) {
        return this.kv.get(k)
    }
    clear() {
        return this.kv.clear()
    }
}

module.exports = Database
