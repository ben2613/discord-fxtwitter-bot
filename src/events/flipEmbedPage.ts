import { Message, MessageCollector, MessageReaction, User } from "discord.js"
import { Cache } from "src/module/tweetMediaEmbed"
import { MyClient } from "src/types/client"

import utils from '../components/utils'

module.exports = {
    name: 'messageReactionAdd',
    execute: async function (reaction: MessageReaction, user: User) {
        // ignore if it is sent by bot
        if (user.bot) {
            return
        }
        if (reaction.partial) {
            try {
                await reaction.fetch()
            } catch (err) {
                console.error('Something wrong fetching reaction partial: ', err)
                return
            }
        }
        // only check message created by bot
        if (reaction.message.author !== null && reaction.client.user !== null
            && !reaction.message.author.equals(reaction.client.user)) {
            return
        }
        if (reaction.message.content === null) return;

        if (reaction.emoji.toString() !== '◀️' && reaction.emoji.toString() !== '▶️') {
            return
        }
        if (reaction.message.embeds.length === 0) {
            return
        }
        // Get tweet URL
        let tweetURL = reaction.message.embeds[0].author?.url || '';
        if (tweetURL === null || !utils.isTweetURL(tweetURL)) {
            return;
        }
        // Get current page from embed footer
        let m = reaction.message.embeds[0].footer?.text.match(/\( (\d) \/ (\d) \)/)
        if (m === null || m === undefined) {
            return;
        }
        let [_, currentPage, totalPages] = m
        // Get cache
        let tweetId = (new URL(tweetURL)).pathname.split('/').pop() as string;
        let mc: MyClient = reaction.client as MyClient;
        let cache = (await mc.db.getTweetCache(tweetId)) as Cache
        if (cache === undefined || cache.media === null) {
            return
        }

        // Do something with < > reaction
        if (reaction.emoji.toString() === '◀️') {
            if (currentPage !== '1') {
                let e = reaction.message.embeds[0].setImage(cache.media.urls[+currentPage - 1 - 1]).setFooter({
                    text: `( ${+currentPage - 1} / ${totalPages} )`
                })
                reaction.message.edit({
                    embeds: [e]
                })
            }
            reaction.users.remove(user)
        } else if (reaction.emoji.toString() === '▶️') {
            if (currentPage !== totalPages) {
                let e = reaction.message.embeds[0].setImage(cache.media.urls[+currentPage - 1 + 1]).setFooter({
                    text: `( ${+currentPage + 1} / ${totalPages} )`
                })
                reaction.message.edit({
                    embeds: [e]
                })
            }
            reaction.users.remove(user)
        }

        // Remove the reaction by user
    }
}
