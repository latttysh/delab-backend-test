import { TonClient, WalletContractV4, TonClient4 } from "@ton/ton"
import { KeyPair, mnemonicNew, mnemonicToPrivateKey, mnemonicToWalletKey } from "ton-crypto";
import { prisma } from "..";

const client = new TonClient({
    endpoint: 'https://toncenter.com/api/v2/jsonRPC',
});
const client4 = new TonClient4({
    endpoint: 'https://toncenter.com/api/v2/jsonRPC',
});


export const createNewWallet = async (userId: number) => {
    const mnemonics: string[] = await mnemonicNew(24);
    const keypair: KeyPair = await mnemonicToPrivateKey(mnemonics);
    const wallet = WalletContractV4.create({ publicKey: keypair.publicKey, workchain: 0 })
    const newUserWallet = await prisma.wallet.create({
        data: {
            userId: userId,
            address: wallet.address.toString(),
            privateKey: keypair.secretKey.toString("hex"),
            publicKey: keypair.publicKey.toString("hex"),
            mnemonics: mnemonics
        }
    })
    return newUserWallet
}


export const getUserWalletInfo = async (userId: number) => {
    const walletCandidate = await prisma.wallet.findFirst({ where: { userId: userId } })
    if (!walletCandidate) {
        return
    }
    const wallet = WalletContractV4.create({ publicKey: Buffer.from(walletCandidate.publicKey, "hex"), workchain: 0 })
    const contract = client.open(wallet)
    return {
        address: walletCandidate.address,
        balance: await contract.getBalance(),
        mnemonics: walletCandidate.mnemonics

    }
}

export const getLastAddress = async () => {
    const masterchainInfo = await fetch("https://toncenter.com/api/index/v1/getChainLastTransactions?workchain=-1&limit=1&offset=0&include_msg_body=true&include_block=true")
    const res = await masterchainInfo.json()

    const url = `https://toncenter.com/api/v2/packAddress?address=${res[0].account}`

    await new Promise(resolve => setTimeout(resolve, 1000));
    const packAddressReq = await fetch(encodeURI(url))

    const packAddressRes = await packAddressReq.json()


    return packAddressRes.result
}