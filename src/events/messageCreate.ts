import { Message } from "discord.js"

const { messageTemplate, urlPattern, isTweetURL } = require('../utils/utils')

module.exports = {
    name: 'messageCreate',
    async execute(msg: Message) {
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
