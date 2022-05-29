import { Message, MessageActionRow, MessageButton } from "discord.js"
import { MyClient } from "src/types/client";
import { quote } from "@discordjs/builders";

module.exports = {
    name: 'messageCreate',
    async execute(msg: Message) {
        // return if DM
        if (msg.guild === null || msg.guildId === null) {
            return;
        }
        // return if self
        if (msg.client.user && msg.author.equals(msg.client.user)) {
            console.log('My own message')
            return
        }
        // ignore if user belongs to a role blacklisted
        let member = msg.guild.members.cache.get(msg.author.id);
        if (member === undefined) {
            console.error('Should not happen');
            return
        }
        let mc = msg.client as MyClient;
        let blacklist = await mc.db.get(msg.guildId, 'roleblacklist') as string[] | undefined;
        let inBlacklist = false;
        if (blacklist !== undefined) {
            for (let role of member.roles.cache.values()) {
                if (blacklist.includes(role.id)) {
                    inBlacklist = true;
                    console.log('Role ', role.name, ' cannot embed')
                    break;
                }
            }
        }
        if (inBlacklist) {
            return
        }
        if (msg.content.split('||').length > 2) {
            // if there is any spoiler pair I refuse to work
            return;
        }
        if (msg.content.includes("https://twitter.com/")) {
            // do not delete original message
            // extract visible tweet urls
            let tweetUrls = mc.formatter.extractVisibleTweetURLs(msg.content);
            let tie = mc.tweetMediaEmbedService;
            let filterRes = await Promise.all(tweetUrls.map(tie.getPossibleSensitive, tie));
            tweetUrls = tweetUrls.filter((v, i) => filterRes[i]);
            if (tweetUrls.length !== 0) {
                let embedsToSend = await tie.getEmbedsFromUrls(tweetUrls);
                for (let i = 0; i < embedsToSend.length; i++) {
                    let reply: Message<boolean>;
                    const e = embedsToSend[i];
                    if (e.url) { // mp4
                        reply = await msg.reply({
                            content: mc.formatter.hideAllLinkEmbed(
                                e.embed.author?.name + "\n" + e.embed.description).split("\n").map(quote).join("\n")
                                + "\n" + e.url,
                            allowedMentions: {
                                repliedUser: false,
                            }
                        });
                    } else {
                        let row = new MessageActionRow();
                        let components: MessageActionRow[] = [row];
                        // Get the total page
                        let totalPage = Number(e.embed.footer?.text.match(/\d \/ ([1234])/)?.at(1)) ?? 1;
                        row.addComponents(new MessageButton().setCustomId('delete').setLabel('X').setStyle('DANGER'))
                        if (totalPage !== 1) {
                            let row2 = new MessageActionRow();
                            components.push(row2);
                            for (let i = 0; i < totalPage; i++) {
                                row2.addComponents(
                                    new MessageButton()
                                        .setCustomId('flip_page_' + (i + 1))
                                        .setLabel('' + (i + 1))
                                        .setStyle('PRIMARY')
                                )
                            }
                            row2.addComponents(
                                new MessageButton()
                                    .setCustomId('expand_all')
                                    .setLabel('All')
                                    .setStyle('SUCCESS')
                            )
                        }
                        reply = await msg.reply({
                            embeds: [e.embed],
                            allowedMentions: {
                                repliedUser: false,
                            },
                            components,
                        });
                    }
                    // const boki = msg.client.emojis.cache.find(emoji => emoji.name !== null && emoji.name.includes('Boki'))
                    // if (boki) {
                    //     await reply.react(boki)
                    // }
                    // await reply.react('❌')
                }
            }
        }
    }
}
