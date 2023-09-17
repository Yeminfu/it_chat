
export interface MessageFromDbInterface {
    id: number
    from_user?: number
    to_user?: number
    text: string
    full_message: string
    created_date: string
}