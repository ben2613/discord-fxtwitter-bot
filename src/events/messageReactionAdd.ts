import { MessageReaction, User } from "discord.js"

const { authorIdRegex } = require('../utils/utils')

module.exports = {
    name: 'messageReactionAdd',
    execute: async function (reaction: MessageReaction, user: User) {
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

        const matches = reaction.message.content.match(authorIdRegex)
        if (matches === null || matches.length !== 2) {
            console.error('Something wrong cannot get author ID from: ', reaction.message.content)
            return
        }
        const authorId = matches[1]
        if (user.id === authorId && reaction.emoji.toString() === '❌') {
            reaction.message.delete()
        }
    }
}
