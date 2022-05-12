import { Collection, Message, MessageEmbed, User } from "discord.js"
import utils from '../utils/utils'
import { MessageMentions } from 'discord.js';

export default class Formatter {
    public tryNeedFxtwitter = function (msgContent: string, embeds: MessageEmbed[]): { need: boolean, message: string } {
        let parts = msgContent.split(utils.urlPattern)
        let allEmbedUrl = embeds.reduce((urls, next) => urls + next.url, '')
        let ret = { need: false, message: '' }
        let build: string[] = []
        for (let p of parts) {
            if (utils.isTweetURL(p)) {
                let url = new URL(p)
                // check if it is in embed
                if (!allEmbedUrl.includes(p)) {
                    url.hostname = 'fxtwitter.com'
                }
                // remove the query part
                url.search = '';
                build.push(url.toString())
                ret.need = true;
            } else {
                build.push(p)
            }
        }
        ret.message = build.join('')
        return ret;
    }
    public getOutgoingMessage(prefxMsg: string, msg: Message): string {
        // keep mentioning author part
        // remove mentions from content
        prefxMsg = this._removeMentions(prefxMsg, msg.mentions.users);
        return utils.messageTemplate(msg.author.toString(), prefxMsg);
    }
    private _removeMentions(content: string, users: Collection<string, User>): string {
        let matches = content.matchAll(MessageMentions.USERS_PATTERN);
        for (let m of matches) {
            content = content.replace(m[0], '@' + (users.get(m[1])?.username ?? ''))
        }
        return content;
    }
}
