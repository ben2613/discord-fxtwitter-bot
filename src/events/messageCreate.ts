import { Message, MessageEmbed, Role } from "discord.js"
import TweetMediaEmbed from "../module/tweetMediaEmbed";
import { MyClient } from "src/types/client";
import { blockQuote, codeBlock, quote } from "@discordjs/builders";

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
            setTimeout(async () => {
                let tweetUrls = mc.formatter.extractUnembeddedTweetURLs(msg.content, msg.embeds);
                let tie = new TweetMediaEmbed(mc.twitterClient, mc.db);
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
                            reply = await msg.reply({
                                embeds: [e.embed],
                                allowedMentions: {
                                    repliedUser: false,
                                }
                            });
                        }
                        const boki = msg.client.emojis.cache.find(emoji => emoji.name !== null && emoji.name.includes('Boki'))
                        if (boki) {
                            await reply.react(boki)
                        }
                        await reply.react('❌')
                        if (e.embed.footer?.text.match(/[234]/)) {
                            reply.react('◀️').then(() => {
                                reply.react('▶️')
                            })
                        }
                    }
                }
            })
        }
    }
}
