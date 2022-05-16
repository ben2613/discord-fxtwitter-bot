import { Message, MessageEmbed, MessagePayload } from "discord.js";
import Database from "src/utils/database";
import { MediaObjectV2, TweetV2LookupResult, TwitterApiReadOnly } from "twitter-api-v2";
type Media = {
    urls: URL[],
    type: string,
}
export default class TweetImageEmbed {
    twitterClient: TwitterApiReadOnly;
    db: Database;
    constructor(twitterClient: TwitterApiReadOnly, db: Database) {
        this.twitterClient = twitterClient;
        this.db = db;
    }
    async getEmbedsFromUrls(tweetURLs: URL[]) {
        let tweetIds = tweetURLs.map(url => url.pathname.split('/').pop() as string);
        let embedsOrFalse = await Promise.all(tweetIds.map(this.getEmbed, this))
        return embedsOrFalse;
    }

    async getEmbed(tweetId: string): Promise<MessageEmbed | boolean> {
        let tweet = await this.fetchTweet(tweetId);
        let tweetMedia = this.getTweetMedia(tweet);
        if (tweetMedia?.type === 'photo') {
            return this.buildEmbed(tweetMedia, tweet);
        } else {
            return false;
        }
    }
    async fetchTweet(tweetId: string): Promise<TweetV2LookupResult> {
        let ret = await this.twitterClient.v2.tweets(tweetId, {
            // "tweet.fields": ["attachments"],
            "media.fields": ["url", "type"],
            "user.fields": ["url", "username", "profile_image_url"],
            "tweet.fields": ["public_metrics", "created_at"],
            "expansions": ["attachments.media_keys", "author_id"],
        })
        return ret;
    }
    getTweetMedia(tweet: TweetV2LookupResult): Media | undefined {
        if (tweet.includes === undefined || tweet.includes.media === undefined || tweet.includes.media.length === 0) {
            return undefined
        }
        let marr = tweet.includes.media;
        let urls: URL[] = [];
        marr.forEach(m => { if (m.url !== undefined) { urls.push(new URL(m.url)) } })
        return {
            urls,
            type: marr[0].type
        };
    }

    // TODO functions for flip page feature later
    saveMediaURLs(urls: string[], tweetId: string) {
        this.db.setGlobal('tweet' + tweetId, urls);
    }
    getMediaURLs(tweetId: string): Promise<unknown> {
        return this.db.getGlobal('tweet' + tweetId);
    }
    buildEmbed(media: Media, tweet: TweetV2LookupResult): MessageEmbed {
        let embed = new MessageEmbed();
        embed.setImage(media.urls[0].toString())
        if (tweet.includes && tweet.includes?.users) {
            let user = tweet.includes?.users[0];
            let url = `https://twitter.com/${user.username}/status/${tweet.data[0].id}`
            embed.setAuthor({
                name: user.name,
                url: url,
                iconURL: user.profile_image_url,
            }).setDescription(tweet.data[0].text
                + "\n\n🔁" + tweet.data[0].public_metrics?.retweet_count
                + "＿＿♥" + tweet.data[0].public_metrics?.like_count
            ).setTimestamp(new Date(tweet.data[0].created_at as string))
                .setFooter({
                    text: `( 1 / ${media.urls.length} )`
                })
        }
        return embed;
    }
}
