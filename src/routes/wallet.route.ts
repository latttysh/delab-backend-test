import { Router } from "express"
import { getLastAddress, getUserWalletInfo } from "../controller"


const router: Router = Router()

router.get("/getBalance", async (req: any, res: any, next: any) => {
    try {
        const { userId } = req.query

        if (!userId) {
            throw new Error()
        }

        const walletInfo = await getUserWalletInfo(Number(userId))
        if (!walletInfo) {
            throw new Error()
        }
        res.send({
            balance: Number(walletInfo?.balance)
        })
    } catch (err) {
        next(err)
        res.status(400)
    }
})

router.get("/getLastAddress", async (req: any, res: any, next: any) => {
    try {
        const lastAddress = await getLastAddress()
        res.send({
            address: lastAddress
        })
    } catch (err) {
        next(err)
    }
})

export const WalletRouter: Router = router