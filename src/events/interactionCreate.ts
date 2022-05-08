import { CommandInteraction, Interaction } from "discord.js"
import { MyClient } from "src/types/client"

module.exports = {
    name: 'interactionCreate',
    async execute(interaction: Interaction) {
        if (!interaction.isCommand() || !(interaction instanceof CommandInteraction)) return
        let client = interaction.client as MyClient
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
