const { Client, Intents } = require("discord.js")
require('dotenv').config()
const urlPattern = /((?:http|ftp|https):\/\/(?:[\w_-]+(?:(?:\.[\w_-]+)+))(?:[\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-]))/

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] })

client.once('ready', () => { console.log('Ready!') })

client.on('messageCreate', async (msg) => {
    console.log(msg.content, msg.partial)
    if (msg.content.includes("https://twitter.com/")) {
        // embeds are empty at the beginning but appears after wait
        // dunno why yet
        setTimeout(() => {
            let parts = msg.content.split(urlPattern)
            let build = []

            let needReplace = false
            let allEmbedUrl = msg.embeds.reduce((prev, next) => prev.url + next.url, '')
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
                msg.channel.send(`From ${msg.author} | ${build.join('')}`)
            }
        }, 5000)
    }
})
client.on('messageUpdate', (oldMsg, newMsg) => {
    console.log('Old embeds:', oldMsg.embeds.length, ' New embeds:', newMsg.embeds)
})

client.login(process.env.TOKEN)

function isTweetURL(url) {
    return url.startsWith("https://twitter.com/") && url.includes('status')
}
