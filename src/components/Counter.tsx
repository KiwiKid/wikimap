import React, { useState, useEffect } from 'react';


interface CounterProps {
    startDate:Date
}
function Counter(props:CounterProps) {
  const [timeDiff, setTimeDiff] = useState(0);
  const { startDate } = props;

  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentTime = new Date();
      const diff = currentTime.getTime() - startDate.getTime();
      setTimeDiff(diff);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [startDate]);

  function formatTimeDiff(diff:number) {
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    return `${days} days, ${hours % 24} hours, ${minutes % 60} minutes, ${seconds % 60} seconds`;
  }

  return (
    <div>
      <h1>Time Since Specific Date</h1>
      <p>Time since {startDate.toLocaleString()}: {formatTimeDiff(timeDiff)}</p>
    </div>
  );
}

export default Counter;