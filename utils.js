module.exports = {
    urlPattern: /((?:http|ftp|https):\/\/(?:[\w_-]+(?:(?:\.[\w_-]+)+))(?:[\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-]))/,
    messageTemplate: (author, content) => `From ${author} | ${content}`,
    authorIdRegex: /^From <@(\d+)>/,
    isTweetURL: function (url) {
        return url.startsWith("https://twitter.com/") && url.includes('status')
    }
}
