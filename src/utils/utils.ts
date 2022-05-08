module.exports = {
    urlPattern: /((?:http|ftp|https):\/\/(?:[\w_-]+(?:(?:\.[\w_-]+)+))(?:[\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-]))/,
    messageTemplate: (author: string, content: string) => `From ${author} | ${content}`,
    authorIdRegex: /^From <@(\d+)>/,
    isTweetURL: function (url: string) {
        return url.startsWith("https://twitter.com/") && url.includes('status')
    }
}
