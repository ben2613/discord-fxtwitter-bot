const fs = require('fs')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')

require('dotenv').config()
const { CLIENT_ID, GUILD_ID, TOKEN } = process.env

const { ArgumentParser } = require('argparse')

const parser = new ArgumentParser({
    description: 'Deploy commands globally or to single server'
})

parser.add_argument('-t', '--to', { choices: ['guild', 'global'], required: true })
args = parser.parse_args()

const commands = []
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    commands.push(command.data.toJSON())
}

const rest = new REST({ version: '9' }).setToken(TOKEN)

let routeFn = args.to === 'guild' ? Routes.applicationGuildCommands : Routes.applicationCommands
rest.put(routeFn(CLIENT_ID, GUILD_ID), { body: commands })
    .then(() => console.log('Successfully registered application commands'))
    .catch(console.error)
