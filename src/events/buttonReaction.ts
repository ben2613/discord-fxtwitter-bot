import { Interaction, Message } from "discord.js"
import { MyClient } from "src/types/client"

module.exports = {
    name: 'interactionCreate',
    execute: async function (interaction: Interaction) {
        if (!interaction.isButton()) return;
        const customId = interaction.customId;
        if (customId !== 'expand_all' && customId !== 'delete' && !customId.startsWith('flip_page_')) {
            return;
        }
        if (customId === 'delete') {
            if (interaction.message instanceof Message) {
                let msg = interaction.message as Message<boolean>
                let orgMsg = await msg.fetchReference()
                const authorId = orgMsg.author.id;
                if (interaction.user.id === authorId) {
                    msg.delete()
                } else {
                    interaction.reply({
                        content: 'Only original poster can delete',
                        ephemeral: true,
                    })
                }
            }
            return;
        }
        let tweetId = interaction.message.embeds[0].url?.split('/').pop();
        if (tweetId !== null && tweetId !== undefined) {
            let mc = interaction.client as MyClient;
            let { media } = await mc.tweetMediaEmbedService.getTweetAndMediaFromCache(tweetId);
            if (customId === 'expand_all') {
                let urls = media?.urls.slice(1) ?? []
                interaction.reply({
                    content: urls.join(' '),
                    ephemeral: true,
                })
            } else {
                interaction.reply({
                    content: media?.urls[Number(customId.slice(-1)) - 1],
                    ephemeral: true,
                })
            }

        }
    }
}
