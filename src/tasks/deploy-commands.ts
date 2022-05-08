import fs = require('fs')
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { exit } from 'process'

require('dotenv').config()
const { CLIENT_ID, GUILD_ID, TOKEN } = process.env
if (CLIENT_ID === undefined || GUILD_ID === undefined || TOKEN === undefined) {
    console.error('config not fulfilled')
    exit(1)
}

const { ArgumentParser } = require('argparse')

const parser = new ArgumentParser({
    description: 'Deploy commands globally or to single server'
})

parser.add_argument('-t', '--to', { choices: ['guild', 'global'], required: true })
let args = parser.parse_args()

const commands = []
const commandFiles = fs.readdirSync('./commands')

for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    commands.push(command.data.toJSON())
}

const rest = new REST({ version: '9' }).setToken(TOKEN)

let routeFn = args.to === 'guild' ? Routes.applicationGuildCommands : Routes.applicationCommands
rest.put(routeFn(CLIENT_ID, GUILD_ID), { body: commands })
    .then(() => console.log('Successfully registered application commands'))
    .catch(console.error)
