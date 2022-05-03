const { urlPattern, isTweetURL } = require('../utils.js')

module.exports = {
    name: 'messageCreate',
    async execute(msg) {
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
    }
}
