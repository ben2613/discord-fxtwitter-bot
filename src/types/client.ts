import { Client, Collection } from "discord.js"
import Database from "../utils/database"
import { Command } from "./command"
import Formatter from "../components/formatter"
import { TwitterApiReadOnly } from "twitter-api-v2"

export type MyClient = Client & {
    commands: Collection<string, Command>,
    db: Database,
    formatter: Formatter,
    twitterClient: TwitterApiReadOnly,
}
