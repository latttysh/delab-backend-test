
import { Context } from "telegraf";
import { prisma } from "..";
import { createNewWallet, getLastAddress, getUserWalletInfo } from "../controller";



export const start = async (ctx: Context) => {
    let newWallet
    const userCandidate = await prisma.user.findFirst({ where: { telegramId: ctx.from?.id } })
    if (userCandidate) {
        newWallet = await prisma.wallet.findFirst({
            where: {
                user: {
                    telegramId: ctx.from?.id
                }
            }
        })
        return ctx.reply(`
        Hello, your ton address: ${newWallet?.address}
        `)

    }
    const newUser = await prisma.user.create({
        data: {
            telegramId: ctx.from?.id || 0
        }
    })

    newWallet = await createNewWallet(newUser.id)

    return ctx.reply(`
        Hello, your ton address: ${newWallet?.address}
        `)
}


export const wallet = async (ctx: Context) => {
    const candidateUser = await prisma.user.findFirst({ where: { telegramId: ctx.from?.id }, include: { Wallet: true } })
    if (!candidateUser) {
        return ctx.reply("You are not registered, use /start")
    }
    return ctx.reply(`Your wallet address: ${candidateUser.Wallet[0].address}`)
}

export const word = async (ctx: Context) => {
    const candidateUser = await prisma.user.findFirst({ where: { telegramId: ctx.from?.id }, include: { Wallet: true } })
    if (!candidateUser) {
        return ctx.reply("You are not registered, use /start")
    }
    return ctx.reply(`Your wallet mnemonics 
||${candidateUser.Wallet[0].mnemonics.map((word: string, index: number) => `${index}\\ ${word} \n`).join("")}||`, {
        parse_mode: "MarkdownV2"
    })

}

export const getBalance = async (ctx: Context) => {
    const candidateUser = await prisma.user.findFirst({ where: { telegramId: ctx.from?.id }, include: { Wallet: true } })
    if (!candidateUser) {
        return ctx.reply("You are not registered, use /start")
    }
    const stats = await getUserWalletInfo(candidateUser.id)
    return ctx.reply(`Your balance: ${stats?.balance}`)
}

export const getLast = async (ctx: Context) => {
    const lastAddress = await getLastAddress()
    return ctx.reply(lastAddress)
}