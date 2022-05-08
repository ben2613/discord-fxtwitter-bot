import fs = require('fs')
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { exit } from 'process'
import path = require('path')
import { Command } from 'src/types/command'

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
const commandFiles = fs.readdirSync(path.join(__dirname, '..', 'commands')).filter(f => f.endsWith('.js') || f.endsWith('.ts'))

for (const file of commandFiles) {
    const command = require(path.join(__dirname, '..', 'commands', file)) as Command
    commands.push(command.data.toJSON())
}

const rest = new REST({ version: '9' }).setToken(TOKEN)

let routeFn = args.to === 'guild' ? Routes.applicationGuildCommands : Routes.applicationCommands
rest.put(routeFn(CLIENT_ID, GUILD_ID), { body: commands })
    .then((ret) => console.log('Successfully registered application commands', ret))
    .catch(console.error)
