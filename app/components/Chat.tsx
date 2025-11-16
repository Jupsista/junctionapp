"use client"

import { Dispatch, SetStateAction, useEffect } from "react"

type ChatProps = {
    chat: string,
    setChat: Dispatch<SetStateAction<string>>,
    onEnter?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export const Chat: React.FC<ChatProps> = ({chat, setChat, onEnter}) => {
    useEffect(() => {
        console.log(chat)
    }, [chat])
    return (
        <div className="flex w-full bg-black">
            <input
                name="ChatInput"
                type="text"
                className="flex w-full h-full m-2 p-2 bg-white rounded-md text-black"
                value={chat}
                onChange={e => setChat(e.target.value)}
                onKeyDown={onEnter}
            />
        </div>
    )
}
