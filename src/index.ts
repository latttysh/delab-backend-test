import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { Telegraf } from "telegraf";
import { getBalance, getLast, start, wallet, word } from "./bot";
import { WalletRouter } from "./routes";
import { PrismaClient } from "@prisma/client";


dotenv.config();

const app: express.Application = express();
const port: number = Number(process.env.PORT) || 3000;

app.use(express.json())
app.use("/api/wallet", WalletRouter)

const bot = new Telegraf(process.env.BOT_TOKEN || "");
bot.command('start', start)
bot.command('wallet', wallet)
bot.command('word', word)
bot.command('getBalance', getBalance)
bot.command('getLastAddress', getLast)
bot.launch()

export const prisma = new PrismaClient()
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});