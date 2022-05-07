const d = require('discord.js')

module.exports = {
    name: 'interactionCreate',
    /** @param {d.Interaction} interaction */
    async execute(interaction) {
        if (!interaction.isCommand()) return

        const command = client.commands.get(interaction.commandName)

        if (!command) return

        try {
            await command.execute(interaction)
        } catch (error) {
            console.error(error)
            await interaction.reply({ content: 'There is something wrong while executing this command!', ephemeral: true })
        }
    }
}
