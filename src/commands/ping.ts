import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Interaction } from 'discord.js';
import { Command } from 'src/types/command';

let ping: Command = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    execute: function (interaction: CommandInteraction): Promise<unknown> {
        return interaction.reply('Pong!')
    }
}

module.exports = ping
