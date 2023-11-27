'use client'

import { useChat } from 'ai/react'
import { FormEvent } from 'react'

export default function Chat() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    data,
    setMessages
  } = useChat({
    onFinish: handleFinish
  })

  function handleFinish() {
    console.log('finished')
    // update messages
    setMessages(messages)
    console.log(messages)
  }

  function sendSubmit(e: FormEvent<HTMLFormElement>) {
    handleSubmit(e)
  }
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.length > 0
        ? messages.map((m) => (
            <div key={m.id} className="whitespace-pre-wrap">
              {m.role === 'user' ? 'User: ' : 'AI: '}
              {m.content}
            </div>
          ))
        : null}

      <form onSubmit={sendSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  )
}
