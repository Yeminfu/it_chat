import { NextResponse } from "next/server";
import { pool } from "../../../../db/connect";
import getUserIdByTelegramId from "../../../../db/users/get/get_user_by_tg_id";

export async function POST(request: Request) {
    const { to_user, text } = await request.json();
    const tg_id = await getTgChatIdByUserId(to_user);
    sendMessageToTg(tg_id, text);

    await createMessageInDb(to_user, text, "");

    return NextResponse.json({
        success: true,
        request,
        tg_id
        // data
    })
}

async function createMessageInDb(to_user: number, text: string, full_message: string) {
    const qs = `INSERT INTO messages (to_user, text, full_message) VALUES (?,?,?)`;
    return await new Promise(resolve => {
        pool.query(
            qs,
            [to_user, text, full_message],
            function (err: any, res: any) {
                if (err) {
                    console.log('err #fkzв4sdf', err);
                }
                resolve(res?.insertId)
            }
        )
    })
}

async function getTgChatIdByUserId(user_id: number): Promise<string> {
    const qs = `SELECT * FROM users WHERE id = ?`;
    return await new Promise(resolve => {
        pool.query(
            qs,
            [user_id],
            function (err: any, res: any) {
                if (err) {
                    console.log('err #fkzс4sdf', err);
                }

                const { tg_id, ...other } = res.pop();
                console.log('other', other);

                resolve(tg_id);
            }
        )
    })
}

async function sendMessageToTg(tg_id: string, text: string) {
    const token = process.env.TELEGRAM_TOKEN;
    const chatId = tg_id;
    const message = text;

    console.log(chatId);


    fetch(`https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${message}`)
        .then(response => response.json())
        .then(async data => {
            // console.log(data);
            const user_id = await getUserIdByTelegramId(Number(chatId));
            // console.log({ user_id });

            // createNewMessage(
            //     null, user_id, text, JSON.stringify(data)
            // )

            // Дополнительные действия после отправки сообщения
        })
        .catch(error => {
            console.error(error);
            // Обработка ошибок при отправке сообщения
        });
}


async function createNewMessage(from_user: number | null, to_user: number | null, text: string, full_message: string, created_date?: string) {

    const values: any = {
        from_user,
        text,
        full_message
    }
    if (created_date) {
        values.created_date = created_date;
    }
    if (to_user) {
        values.to_user = to_user;
    }
    if (from_user) {
        values.from_user = from_user;
    }

    const qs = `INSERT INTO messages (${String(Object.keys(values))}) VALUES (${String(Object.keys(values).map(_ => "?"))})`;
    return await new Promise(resolve => {
        pool.query(
            qs,
            Object.values(values),
            function (err: any, res: any) {
                if (err) {
                    console.log('err #fk5z4sdf', err);
                }
                resolve(res?.insertId)
            }
        )
    })
}
