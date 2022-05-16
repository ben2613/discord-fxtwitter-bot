import { Collection, Message, MessageEmbed, User } from "discord.js"
import utils from '../utils/utils'
import { MessageMentions } from 'discord.js';

export default class Formatter {
    public extractUnembeddedTweetURLs = function (msgContent: string, embeds: MessageEmbed[]): URL[] {
        let parts = msgContent.split(utils.urlPattern)
        let allEmbedUrl = embeds.reduce((urls, next) => urls + next.url, '')
        let ret: URL[] = []
        for (let p of parts) {
            if (utils.isTweetURL(p) && !allEmbedUrl.includes(p)) {
                // check if it is in embed
                let url = new URL(p)
                ret.push(url)
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
}
