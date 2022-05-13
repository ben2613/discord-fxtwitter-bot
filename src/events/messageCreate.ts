import { Message, MessageEmbed, Role } from "discord.js"
import TweetMediaEmbed from "../module/tweetMediaEmbed";
import { MyClient } from "src/types/client";

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
            // embeds are empty at the beginning but appears after wait
            // dunno why yet
            setTimeout(async () => {
                let { need, message, tweetUrls } = mc.formatter.tryNeedFxtwitter(msg.content, msg.embeds);
                if (need) {
                    msg.delete()

                    let newMsg = await msg.channel.send(mc.formatter.getOutgoingMessage(message, msg))
                    const boki = msg.client.emojis.cache.find(emoji => emoji.name !== null && emoji.name.includes('Boki'))
                    let tie = new TweetMediaEmbed(mc.twitterClient)
                    let tweetId = tweetUrls[0].pathname.split('/').pop();
                    if (tweetId && tweetId.match(/\d+/)) {
                        let embeds = await tie.getEmbeds(tweetId)
                        if (embeds.length > 0) {
                            newMsg.edit({ embeds: [embeds[0]] })
                        }
                    }
                    if (boki) {
                        await newMsg.react(boki)
                    }
                    newMsg.react('❌')
                }
            }, 5000)
        }
    }
}
