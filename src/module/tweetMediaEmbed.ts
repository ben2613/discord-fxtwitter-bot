import { Message, MessageEmbed, MessagePayload } from "discord.js";
import Database from "src/components/database";
import { MediaEntityV1, MediaObjectV2, TweetV1, TweetV2LookupResult, TwitterApiReadOnly } from "twitter-api-v2";
type Media = {
    urls: string[],
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
        let embeds = await Promise.all(tweetIds.map(this.getEmbed, this))
        return embeds;
    }

    async getEmbed(tweetId: string): Promise<{ url?: string, embed: MessageEmbed }> {
        let tweet: TweetV1 | null = null;
        let media: Media | null = null;
        let cached = await this.getMediaURLs(tweetId);
        if (cached !== undefined) {
            let { media: m, tweet: t } = cached as { media: Media | null, tweet: TweetV1 }
            tweet = t;
            media = m;
        } else {
            tweet = await this.fetchTweetv1(tweetId);
            media = this.getTweetMediav1(tweet);
            if (media !== null) {
                await this.setMediaURLs(tweetId, { tweet, media })
            } else {
                await this.setMediaURLs(tweetId, { tweet, media: null })
            }
        }
        if (media?.type === 'photo') {
            return { embed: this.buildEmbed(media, tweet) };
        } else if (media !== null) { // mp4
            return { url: media?.urls[0].toString() ?? '', embed: this.buildEmbed(media, tweet) };
        } else { // text only tweet?
            return { embed: this.buildEmbed(null, tweet) };
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
        let urls: string[] = [];
        marr.forEach(m => { if (m.url !== undefined) { urls.push(m.url) } })
        return {
            urls,
            type: marr[0].type
        };
    }
    async fetchTweetv1(tweetId: string): Promise<TweetV1> {
        let ret = await this.twitterClient.v1.tweets(tweetId);
        return ret[0];
    }
    getTweetMediav1(tweet: TweetV1): Media | null {
        if (tweet.extended_entities === undefined || tweet.extended_entities.media === undefined) {
            return null;
        }
        function getUrlByType(e: MediaEntityV1): string {
            if (e.type === 'video' || e.type === 'animated_gif') {
                return e.video_info?.variants.reduce((p, c) => {
                    if (!p.content_type.startsWith('video')) {
                        return c;
                    }
                    if (!c.content_type.startsWith('video')) {
                        return p;
                    }
                    if (p.bitrate > c.bitrate) {
                        return p;
                    } else {
                        return c;
                    }
                }, { bitrate: 0, content_type: 'dummy', url: '' }).url as string
            } else { // photo
                return e.media_url;
            }
        }
        return {
            type: tweet.extended_entities.media[0].type,
            urls: tweet.extended_entities.media.map(getUrlByType),
        }
    }

    // TODO functions for flip page feature later
    setMediaURLs(tweetId: string, cache: { media: Media | null, tweet: TweetV1 }) {
        return this.db.setGlobal('tweet' + tweetId, cache);
    }
    getMediaURLs(tweetId: string): Promise<unknown | undefined> {
        return this.db.getGlobal('tweet' + tweetId);
    }
    buildEmbed(media: Media | null, tweet: TweetV1): MessageEmbed {
        let embed = new MessageEmbed();
        if (media !== null) {
            embed.setImage(media.urls[0].toString())
                .setFooter({
                    text: `( 1 / ${media.urls.length} )`
                })
        }
        let user = tweet.user
        let url = `https://twitter.com/${user.screen_name}/status/${tweet.id}`
        embed.setAuthor({
            name: user.name,
            url: url,
            iconURL: user.profile_image_url_https,
        }).setDescription((tweet.full_text ?? '')
            + "\n\n🔁" + tweet.retweet_count
            + "＿＿♥" + tweet.favorite_count
        ).setTimestamp(new Date(tweet.created_at))
        return embed;
    }
}
