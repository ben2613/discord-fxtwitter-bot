import { MessageEmbed } from "discord.js";
import { TweetV2LookupResult, TwitterApiReadOnly } from "twitter-api-v2";

export default class TweetImageEmbed {
    twitterClient: TwitterApiReadOnly;
    constructor(twitterClient: TwitterApiReadOnly) {
        this.twitterClient = twitterClient;
    }
    async getEmbeds(tweetId: string): Promise<MessageEmbed[]> {
        let tweet = await this.fetchTweet(tweetId);
        return this.formatFirstEmbed(this.buildEmbeds(await this.getMediaUrl(tweetId)), tweet)
    }
    async fetchTweet(tweetId: string) {
        return this.twitterClient.v2.tweets(tweetId, {
            // "tweet.fields": ["attachments"],
            "media.fields": ["url"],
            "user.fields": ["url", "username", "profile_image_url"],
            "tweet.fields": ["public_metrics", "created_at"],
            "expansions": ["attachments.media_keys", "author_id"],
        });
    }
    async getMediaUrl(tweetId: string): Promise<string[]> {
        let ret: string[] = [];
        let a = await this.twitterClient.v2.tweets(tweetId, {
            "media.fields": ["url"],
            "expansions": ["attachments.media_keys", "author_id"]
        });
        if (a.includes !== undefined && a.includes.media !== undefined) {
            for (let i = 0; i < a.includes.media.length; i++) {
                ret.push(a.includes.media.at(i)?.url as string)
            }
        }
        return ret;
    }
    buildEmbeds(imageUrl: string[]): MessageEmbed[] {
        return imageUrl.map(url => {
            let embed = new MessageEmbed();
            embed.setFields()
            embed.setImage(url);
            return embed;
        })
    }
    formatFirstEmbed(embeds: MessageEmbed[], tweet: TweetV2LookupResult) {
        if (tweet.includes && tweet.includes?.users) {
            let user = tweet.includes?.users[0];
            let url = `https://twitter.com/${user.username}/status/${tweet.data[0].id}`
            embeds[0].setAuthor({
                name: user.name,
                url: url,
                iconURL: user.profile_image_url,
            }).setDescription(tweet.data[0].text
                + "\n\n🔁" + tweet.data[0].public_metrics?.retweet_count
                + "＿＿♥" + tweet.data[0].public_metrics?.like_count
            ).setTimestamp(new Date(tweet.data[0].created_at as string))
                .setFooter({
                    text: `( 1 / ${embeds.length} )`
                })
        }
        return embeds;
    }
}
