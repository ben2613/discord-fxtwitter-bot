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
        if (reaction.message.content === null) return;

        // Do something with < > reaction
        // Remove the reaction by user
    }
}
