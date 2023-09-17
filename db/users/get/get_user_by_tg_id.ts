
//  async function getUserByTgId(tg_id: string) {
//     console.log('getUserByTgId', tg_id);
// }

import { pool } from "../../connect";


export default async function getUserIdByTelegramId(tg_id: number): Promise<number> {
    return await new Promise(resolve => {
        pool.query(
            "SELECT * FROM users WHERE tg_id = ?",
            [tg_id],
            function (err: any, res: any) {
                if (err) {
                    console.log('err #fkf8o3df', err);
                }

                resolve(res.pop().id)
            }
        )
    })
}