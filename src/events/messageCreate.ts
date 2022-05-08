import { Message, Role } from "discord.js"
import { MyClient } from "src/types/client";

const { messageTemplate, urlPattern, isTweetURL } = require('../utils/utils')

module.exports = {
    name: 'messageCreate',
    async execute(msg: Message) {
        // return if DM
        if (msg.guild === null || msg.guildId === null) {
            return;
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
        if (msg.content.includes("https://twitter.com/")) {
            // embeds are empty at the beginning but appears after wait
            // dunno why yet
            setTimeout(async () => {
                let parts = msg.content.split(urlPattern)
                let build: string[] = []

                let needReplace = false
                let allEmbedUrl = msg.embeds.reduce((urls, next) => urls + next.url, '')
                parts.forEach((p) => {
                    if (isTweetURL(p) && !allEmbedUrl.includes(p)) {
                        // check if it is in embed
                        let url = new URL(p)
                        url.hostname = 'fxtwitter.com'
                        build.push(url.href)
                        needReplace = true
                    } else {
                        build.push(p)
                    }
                })
                if (needReplace) {
                    msg.delete()
                    let newMsg = await msg.channel.send(messageTemplate(msg.author, build.join('')))
                    const boki = msg.client.emojis.cache.find(emoji => emoji.name !== null && emoji.name.includes('Boki'))
                    if (boki) {
                        await newMsg.react(boki)
                    }
                    newMsg.react('❌')
                }
            }, 5000)
        }
    }
}
