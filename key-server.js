// This file will contain class key-server

import { Mutex } from 'async-mutex';

export class KeyServer {
    constructor() {
        this.keys = {}
        this.freeKeys = {}
        this.mutex = new Mutex()
    }

    static randomKey = (length) => {
        return Math.random().toString(36).substr(2, length);
    }

    generateKey = async () => {
        const key = KeyServer.randomKey(8);
        await this.mutex.runExclusive(() => {
            this.keys[key] = { timestamp: null }
            this.freeKeys[key] = true
        })

        return key;
    }

    fetchKey = async () => {
        if (Object.keys(this.freeKeys).length <= 0) return "404: Not Found";
        let key = -1;
        await this.mutex.runExclusive(() => {
            key = Object.keys(this.freeKeys)[0]
            delete this.freeKeys[key];
            this.keys[key].timestamp = new Date()
        })
        return key
    }

    unblockKey = async (key) => {
        if (this.keys[key] === undefined) return false;
        await this.mutex.runExclusive(() => {
            this.keys[key].timestamp = null;
            this.freeKeys[key] = true
        })
        return key + " Unblocked Successfully"
    }

    deleteKey = async (key) => {
        if (this.keys[key] === undefined) return false;
        await this.mutex.runExclusive(() => {
            delete this.keys[key]
            delete this.freeKeys[key]
        })
        return key + " Deleted Successfully"
    }

    keepKeyAlive = async (key) => {
        if (this.keys[key] === undefined) return "Key provided is not present in the keystore";
        await this.mutex.runExclusive(() => {
            this.keys[key].timestamp = new Date()
        })
        return key + " is now alive"
    }

    expired = (key, time) => {
        if (this.keys[key] === undefined || this.keys[key].timestamp === null) return false;
        return new Date().getTime() - this.keys[key].timestamp.getTime() > time * 1000;
    }

    cleanUp = async () => {
        for (let key in this.keys)
            if (this.expired(key, 300))
                await this.deleteKey(key);
            else if (this.expired(key, 60)) {
                await this.unblockKey(key)
            }

    }
}