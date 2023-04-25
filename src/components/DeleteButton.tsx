import React, { ChangeEvent, FormEvent, useState } from 'react';
import { api } from '~/utils/api';

const DeleteButton = () => {
  const [text, setText] = useState('');
    const reset = api.utils.resetAll.useMutation();
  const handleChange = (event:ChangeEvent<HTMLInputElement>) => {
    setText(event.currentTarget.value)
  };

  const handleSubmit = (event:FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Do something with the text, like submit it to a server
    reset.mutate({ secretDeleteCode: text})
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        onChange={handleChange}
        className="border border-gray-400 rounded-lg py-2 px-4 mr-2"
        placeholder="Enter some text"
      />
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Reset All
      </button>
    </form>
  );
};

export default DeleteButton;