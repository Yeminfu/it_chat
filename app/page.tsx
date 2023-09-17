import { UserFromDbInterface } from './types/user';
import { MessageFromDbInterface } from './types/message';
import SendMessageForm from './sendMessageForm';
import dayjs from 'dayjs';
import allMessagesString from '../allMessages.string';
import { pool } from '../db/connect';

export default async function Home() {
    const usersFromDb = await getUsers();

    const messages = allMessagesString.split(/\n\n/);

    for (let index = 0; index < messages.length; index++) {

        const message = messages[index];

        const [firstRow, secondRow, ...otherRows]: any = message.split("\n");

        const [firstWord, secondWord, thirtWord] = secondRow.split(" ");

        const dateTime = firstRow.split(", ").pop().replace(/\[|\]/igm, "")

        // if (firstWord === "send") {
        //     const tg_chat_id = secondWord.split(" ").pop();
        //     const user_id = await getUserIdByTelegramId(tg_chat_id);
        //     const newMessageId = await createNewMessage(
        //         null,
        //         user_id,
        //         [...otherRows,].join("\n"),
        //         ""
        //     );
        //     console.log('newMessageId', { newMessageId, tg_chat_id, user_id });
        // }

        // if (firstWord === "Зашел") {
        //     console.log('зашел');
        //     const вСкобках = secondRow.replace(/(^.+\()|(\).+)/igm, "");
        //     const itemsВСкобках = вСкобках.split(",");
        //     const [tg_username, tg_id] = itemsВСкобках;
        //     const qs = `INSERT INTO users (tg_username,tg_id) VALUES ('${tg_username}',${Number(tg_id)});`
        //     await new Promise(resolve => {
        //         pool.query(
        //             qs,
        //             function (err, res) {
        //                 if (err) {
        //                     // console.log('err #fkddsdf', err);
        //                 }
        //                 resolve(res)
        //             }
        //         )
        //     })
        // }

        // if (firstWord === "Пришло") {
        //     const вСкобках = secondRow.replace(/(^.+\()|\)/igm, "");
        //     console.log('пришло', вСкобках);
        //     const [firstWord, telegram_id, thirtWord, ...text] = вСкобках.split(", ");
        //     const user_id = await getUserIdByTelegramId(telegram_id);
        //     const newMessage = await createNewMessage(user_id, null, String(text), message);
        //     console.log('newMessage #asd', newMessage);
        // }

    }

    const usersWithMessages: {
        user: UserFromDbInterface,
        messages: MessageFromDbInterface[]
    }[] = [];

    for (let index = 0; index < usersFromDb.length; index++) {
        const user = usersFromDb[index];
        const messagesFromDb = await getMessagesByUserTgId(user.id);
        usersWithMessages.push({ user, messages: messagesFromDb })
    }

    return (
        <main>
            <table className='table table-bordered table-striped'>
                <tbody>
                    {usersWithMessages
                        .map(user => <tr key={user.user.id}>
                            <td>
                                {user.user.tg_username} ({user.user.id})
                            </td>
                            {user.messages.map(message => <td key={message.id}>
                                <div style={{ maxWidth: "300px" }}>{message.text}</div>
                                <div>{(() => {
                                    const output = dayjs(message.created_date).format("DD.MM.YYYY hh:mm");
                                    const diffHours = dayjs().diff(dayjs(message.created_date), 'hour');
                                    return <div className={`${(diffHours < 12 && message.from_user) ? "text-danger" : ""}`}>{output} ({diffHours})</div>
                                })()}</div>
                                <span>{message.from_user && "from_user"} {message.to_user && "to_user"}</span>

                                {/* <pre>{JSON.stringify(message, null, 2)}</pre> */}
                            </td>)}
                            <td><SendMessageForm userId={user.user.id} /></td>
                        </tr>)}
                </tbody>
            </table>
        </main>
    )
}



async function getUsers(): Promise<UserFromDbInterface[]> {
    return await new Promise(resolve => {
        pool.query(
            "SELECT * FROM users ORDER BY id DESC",
            function (err: any, res: any) {
                if (err) {
                    console.log('err #mcdks9', err);
                }
                resolve(res);
            }
        )
    })
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
                    console.log('err #fkz4sdf', err);
                }
                resolve(res?.insertId)
            }
        )
    })
}

async function getUserIdByTelegramId(telegram_id: number): Promise<number> {
    return await new Promise(resolve => {
        pool.query(
            "SELECT * FROM users WHERE tg_id = ?",
            [telegram_id],
            function (err: any, res: any) {
                if (err) {
                    console.log('err #fksdf', err);
                }
                resolve(res?.pop()?.id)
            }
        )
    })
}



async function getMessagesByUserTgId(user_id: number): Promise<MessageFromDbInterface[]> {
    return await new Promise(resolve => {
        pool.query(
            "SELECT * FROM messages WHERE from_user = ? OR to_user = ?",
            [user_id, user_id],
            function (err: any, res: any) {
                if (err) {
                    console.log('err #fkszo3df', err);
                }
                resolve(res || [])
            }
        )
    })
}