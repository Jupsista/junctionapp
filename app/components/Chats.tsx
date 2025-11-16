"use client";

import React from "react";

type UserType = "user" | "ai";

type SingleChat = {
  user: UserType;
  text: string;
};

type ChatsProps = {
  chats: SingleChat[];
};

export const Chats: React.FC<ChatsProps> = ({ chats }) => {
  return (
    <div className="flex flex-col w-full gap-3 p-4 overflow-y-auto h-full">
      {chats.map((c, i) => (
        <div
          key={i}
          className={`max-w-[80%] px-3 py-2 rounded-lg ${
            c.user === "user"
              ? "bg-blue-600 text-white self-end"
              : "bg-gray-700 text-white self-start"
          }`}
        >
          {c.text}
        </div>
      ))}
    </div>
  );
};
