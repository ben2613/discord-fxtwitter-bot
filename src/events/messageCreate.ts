import { Message, MessageEmbed, Role } from "discord.js"
import { MyClient } from "src/types/client";

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
                let { need, message } = mc.formatter.tryNeedFxtwitter(msg.content, msg.embeds);
                if (need) {
                    msg.delete()
                    let newMsg = await msg.channel.send(mc.formatter.getOutgoingMessage(message, msg))
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
