module.exports = {
    urlPattern: /((?:http|ftp|https):\/\/(?:[\w_-]+(?:(?:\.[\w_-]+)+))(?:[\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-]))/,
    isTweetURL: function (url) {
        return url.startsWith("https://twitter.com/") && url.includes('status')
    }
}
