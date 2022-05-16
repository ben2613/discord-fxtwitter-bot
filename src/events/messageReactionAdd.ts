import { MessageReaction, User } from "discord.js"

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
        if (reaction.message.partial) {
            try {
                await reaction.message.fetch()
            } catch (err) {
                console.error('error fetching message ', err)
            }
        }
        // only check message created by bot
        if (reaction.message.author !== null && reaction.client.user !== null
            && !reaction.message.author.equals(reaction.client.user)) {
            return
        }
        if (reaction.message.content === null) return;

        const authorId = reaction.message.mentions.repliedUser?.id
        if (user.id === authorId && reaction.emoji.toString() === '❌') {
            reaction.message.delete()
        }
    }
}
