'use client';

import { useChat } from 'ai/react';
import { useState } from 'react';


export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, data } = useChat({
    api: '/api/chat-with-vision',
  });
  const [selectedFile, setSelectedFile] = useState('');

  function handleFileInput(e) {
    setSelectedFile(e.target.files[0]);
  }

  

  return (
    <div className="flex flex-col w-full max-w-xl py-24 mx-auto stretch bg-slate-100">
      <div>
        Teste form
        <label htmlFor="avatar">Choose a profile picture:</label>
        <input 
              id="avatar" name="avatar"
              multiple={true} 
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.files[0])} 
              type="file" 
              tabIndex={-1} 
              className="hidden" 
               />
      </div>
      {messages.length > 0
        ? messages.map(m => (
            <div key={m.id} className="whitespace-pre-wrap">
              {m.role === 'user' ? 'User: ' : 'AI: '}
              {m.content}
            </div>
          ))
        : null}

      <form
        onSubmit={e => {
          handleSubmit(e, {
            data: {
              imageUrl:
                'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Field_sparrow_in_CP_%2841484%29_%28cropped%29.jpg/733px-Field_sparrow_in_CP_%2841484%29_%28cropped%29.jpg',
            },
          });
        }}
      >
        <div className='fixed bottom-0 w-full max-w-xl mb-8 flex border rounded-sm shadow-lg border-gray-300 p-2'>

        <div className="absolute bottom-2 md:bottom-4 left-1 md:left-1">
          <div className="flex">
            <button onClick={e => fileInput.current && fileInput.current.click()} className="btn relative p-0 text-black dark:text-white" aria-label="Attach files">
              <div className="flex w-full gap-2 items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9 7C9 4.23858 11.2386 2 14 2C16.7614 2 19 4.23858 19 7V15C19 18.866 15.866 22 12 22C8.13401 22 5 18.866 5 15V9C5 8.44772 5.44772 8 6 8C6.55228 8 7 8.44772 7 9V15C7 17.7614 9.23858 20 12 20C14.7614 20 17 17.7614 17 15V7C17 5.34315 15.6569 4 14 4C12.3431 4 11 5.34315 11 7V15C11 15.5523 11.4477 16 12 16C12.5523 16 13 15.5523 13 15V9C13 8.44772 13.4477 8 14 8C14.5523 8 15 8.44772 15 9V15C15 16.6569 13.6569 18 12 18C10.3431 18 9 16.6569 9 15V7Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </div>
            </button>
            <input
              id="fileInput" 
              name="fileInput"
              multiple={true} 
              value={selectedFile}
              onChange={handleFileInput} 
              type="file" 
              tabIndex={-1} 
              className="hidden" 
               />
            
          </div>
        </div>
        <input
          className=" py-2 mx-auto w-full max-w-lg "
          value={input}
          placeholder="What does the image show..."
          onChange={handleInputChange}
        />
        <button className='absolute bottom-2 md:bottom-4 md:right-1 dark:hover:bg-gray-900 dark:disabled:hover:bg-transparent right-2 dark:disabled:bg-white disabled:bg-black disabled:opacity-10 disabled:text-gray-400 enabled:bg-black text-white p-0.5 border border-black rounded-lg dark:border-white dark:bg-white  transition-colors'><svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white dark:text-black"><path d="M7 11L12 6L17 11M12 18V7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg></button>
        </div>
      </form>
    </div>
  );
}
