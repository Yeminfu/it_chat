"use client"
import { useForm } from "react-hook-form";

interface Inputs {
    to_user: number | string
    text: number | string
}

export default function SendMessageForm(props: { userId: number }) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<Inputs>({
        defaultValues: {
            to_user: props.userId
        }
    });
    return <>
        <form onSubmit={handleSubmit(e => {
            reset();
            return onSubmit(e)
        })}>
            <input {...register("to_user", { required: true })} className="d-none" />
            <textarea {...register("text", { required: true })} />
            <input type="submit" />
        </form>
    </>
}

const onSubmit = (data: any) => {

    fetch(`/api/messages/send`, { method: "POST", body: JSON.stringify(data) })
        .then(x => x.json())
        .then(x => {
            console.log('xxx', x);
        })

}
