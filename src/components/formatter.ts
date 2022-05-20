import { Collection, Message, MessageEmbed, User } from "discord.js"
import utils from './utils'
import { MessageMentions } from 'discord.js';
import { hideLinkEmbed } from "@discordjs/builders";

export default class Formatter {
    public extractUnembeddedTweetURLs = function (msgContent: string, embeds: MessageEmbed[]): URL[] {
        let lines = msgContent.split("\n")
        let lineparts = lines.map(l => { return { line: l, parts: l.split(utils.urlPattern) } });
        let allEmbedUrl = embeds.reduce((urls, next) => urls + next.url, '')
        let ret: URL[] = []
        for (let { line, parts } of lineparts) {
            // if the link is unembed <> or in quote return
            if (line.startsWith('>')) {
                continue;
            }
            for (let i = 0; i < parts.length; i++) {
                const p = parts[i];
                if (i !== 0 && i !== parts.length - 1) {
                    if (parts[i - 1].endsWith('<') && parts[i + 1].startsWith('>'))
                        continue;
                }
                if (utils.isTweetURL(p) && !allEmbedUrl.includes(p)) {
                    // check if it is in embed
                    let url = new URL(p)
                    ret.push(url)
                }
            }
        }
        return ret;
    }
    public getOutgoingMessage(prefxMsg: string, msg: Message): string {
        // keep mentioning author part
        // remove mentions from content
        prefxMsg = this._removeMentions(prefxMsg, msg.mentions.users);
        return utils.messageTemplate(msg.author.toString(), prefxMsg);
    }
    /** flow changed, not used any more */
    private _removeMentions(content: string, users: Collection<string, User>): string {
        let matches = content.matchAll(MessageMentions.USERS_PATTERN);
        for (let m of matches) {
            content = content.replace(m[0], '@' + (users.get(m[1])?.username ?? ''))
        }
        return content;
    }
    public hideAllLinkEmbed(c: string) {
        return c.split(utils.urlPattern).map(p => p.startsWith('http') ? hideLinkEmbed(p) : p).join('')
    }
}
