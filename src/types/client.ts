import { Client, Collection } from "discord.js"
import Database from "../utils/database"
import { Command } from "./command"

export type MyClient = Client & {
    commands: Collection<string, Command>,
    db: Database
}
