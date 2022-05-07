const fs = require('fs')
const { Client, Intents, Collection } = require("discord.js")
const DB = require('./utils/database.js')
require('dotenv').config()

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
})

const eventFiles = fs.readdirSync('./events/').filter(file => file.endsWith('js'))

for (const file of eventFiles) {
    const event = require(`./events/${file}`)
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args))
    } else {
        client.on(event.name, (...args) => event.execute(...args))
    }
}

// Register commands
client.commands = new Collection()
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    client.commands.set(command.data.name, command)
}

// Register DB into client, for events / commands to use
client.db = new DB(process.env.DB_CONNSTR)

client.once('ready', () => { console.log('Ready!') })

client.login(process.env.TOKEN)
