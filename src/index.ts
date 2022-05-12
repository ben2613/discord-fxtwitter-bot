import fs = require('fs')
import { cwd } from 'process'
import { Client, Intents, Collection } from "discord.js"
import { MyClient } from './types/client'
import DB from './utils/database'
import 'dotenv/config'
import path from 'path';
import { Command } from './types/command'
import Formatter from './components/formatter'

const client: MyClient = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
}) as MyClient

if (fs.existsSync(path.join(__dirname, 'events'))) {
    const eventFiles = fs.readdirSync(path.join(__dirname, 'events')).filter(f => f.endsWith('.js') || f.endsWith('.ts'))

    for (const file of eventFiles) {
        const event = require(path.join(__dirname, 'events', file))
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args))
        } else {
            client.on(event.name, (...args) => event.execute(...args))
        }
    }
}

// Register commands
client.commands = new Collection<string, Command>()

if (fs.existsSync(path.join(__dirname, 'commands'))) {
    const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(f => f.endsWith('.js') || f.endsWith('.ts'))
    for (const file of commandFiles) {
        const command = require(path.join(__dirname, 'commands', file)) as Command
        client.commands.set(command.data.name, command)
    }
}

// Register DB into client, for events / commands to use
client.db = new DB(process.env.DB_CONNSTR)

client.formatter = new Formatter()

client.once('ready', () => { console.log('Ready!') })

client.login(process.env.TOKEN)
