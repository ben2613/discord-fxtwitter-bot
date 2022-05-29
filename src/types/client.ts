import { Client, Collection } from "discord.js"
import Database from "../components/database"
import { Command } from "./command"
import Formatter from "../components/formatter"
import { TwitterApiReadOnly } from "twitter-api-v2"
import TweetImageEmbed from "src/module/tweetMediaEmbed"

export type MyClient = Client & {
    commands: Collection<string, Command>,
    db: Database,
    formatter: Formatter,
    twitterClient: TwitterApiReadOnly,
    tweetMediaEmbedService: TweetImageEmbed,
}
