import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { MyClient } from 'src/types/client';
import { Command } from 'src/types/command';

let ignoreRole: Command = {
    data: new SlashCommandBuilder()
        .addRoleOption(role => role.setName('noecchi').setDescription('Select role that for this bot to ignore'))
        .setName('ignorerole')
        .setDescription('Ignore certain role'),
    execute: async function (interaction: CommandInteraction): Promise<unknown> {
        let mc = interaction.client as MyClient
        if (interaction.guildId === null) {
            console.error('Guild id is null, this is a DM?');
            return interaction.reply('This bot can only be used in a Server!');
        }

        let incomingRole = interaction.options.getRole('noecchi')?.id;
        if (incomingRole === undefined) return interaction.reply('Role undefined');

        let record = (await mc.db.get(interaction.guildId, 'roleblacklist')) as string[] | undefined;
        if (record === undefined) {
            record = [];
        }

        if (!record.includes(incomingRole)) {
            record.push(incomingRole);
            mc.db.set(interaction.guildId, 'roleblacklist', record);
        }
        return interaction.reply('Role already ignored!');
    }
}

module.exports = ignoreRole
