import React, { useState, useEffect, useRef } from "react";

export default function App() {
  const [inputMin, setInputMin] = useState("0");
  const [inputSec, setInputSec] = useState("0");

  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((sec) => sec - 1);
      }, 1000);
    }
    if (!isRunning || remainingSeconds === 0) {
      clearInterval(intervalRef.current);
      if (remainingSeconds === 0 && totalSeconds !== 0) {
        setIsRunning(false);
      }
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, remainingSeconds, totalSeconds]);

  const startTimer = () => {
    const min = parseInt(inputMin, 10);
    const sec = parseInt(inputSec, 10);

    if (
      isNaN(min) ||
      isNaN(sec) ||
      min < 0 ||
      sec < 0 ||
      sec >= 60 ||
      (min === 0 && sec === 0)
    ) {
      alert("正しい分（0以上）と秒（0～59）を入力してください");
      return;
    }

    const total = min * 60 + sec;
    setTotalSeconds(total);
    setRemainingSeconds(total);
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setRemainingSeconds(totalSeconds);
  };

  const displayMin = Math.floor(remainingSeconds / 60);
  const displaySec = remainingSeconds % 60;

  const secondsAngle = (remainingSeconds % 60) * 6;
  const minutesAngle = Math.floor(remainingSeconds / 60) * 6;

  // 色の変化：半分以上は白、半分切ったら白→赤に変化
  const halfTime = totalSeconds / 2;
  let bgColor;
  if (remainingSeconds > halfTime) {
    bgColor = "rgb(255, 255, 255)";
  } else {
    const ratio = halfTime === 0 ? 0 : remainingSeconds / halfTime;
    const greenBlue = Math.floor(255 * ratio);
    bgColor = `rgb(255, ${greenBlue}, ${greenBlue})`;
  }

  return (
    <div
      style={{
        height: "100vh",
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial, sans-serif",
        transition: "background-color 1s linear",
      }}
    >
      <h1>アナログタイマー</h1>

      <div style={{ marginBottom: 20 }}>
        <label>
          分:{" "}
          <input
            type="number"
            min="0"
            value={inputMin}
            onChange={(e) => setInputMin(e.target.value)}
            style={{ width: 50 }}
          />
        </label>
        <label style={{ marginLeft: 10 }}>
          秒:{" "}
          <input
            type="number"
            min="0"
            max="59"
            value={inputSec}
            onChange={(e) => setInputSec(e.target.value)}
            style={{ width: 50 }}
          />
        </label>
      </div>

      <div style={{ marginBottom: 30 }}>
        {!isRunning && (
          <button onClick={startTimer} style={{ marginRight: 10 }}>
            スタート
          </button>
        )}
        {isRunning && (
          <button onClick={pauseTimer} style={{ marginRight: 10 }}>
            一時停止
          </button>
        )}
        <button onClick={resetTimer}>リセット</button>
      </div>

      <svg width="200" height="200" viewBox="0 0 100 100">
        {/* 時計盤（色が動的に変わる部分） */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill={bgColor}
          stroke="#000"
          strokeWidth="2"
        />

        {[...Array(12)].map((_, i) => {
          const minute = i * 5;
          const angle = (minute * 6 - 90) * (Math.PI / 180);
          const radius = 42;
          const x = 50 + radius * Math.cos(angle);
          const y = 50 + radius * Math.sin(angle);

          return (
            <text
              key={minute}
              x={x}
              y={y + 3}
              textAnchor="middle"
              fontSize="6"
              fill="#000"
              pointerEvents="none"
              style={{ userSelect: "none" }}
            >
              {minute}
            </text>
          );
        })}

        <line
          x1="50"
          y1="50"
          x2="50"
          y2="20"
          stroke="#000"
          strokeWidth="3"
          strokeLinecap="round"
          transform={`rotate(${minutesAngle} 50 50)`}
        />

        <line
          x1="50"
          y1="50"
          x2="50"
          y2="10"
          stroke="red"
          strokeWidth="2"
          strokeLinecap="round"
          transform={`rotate(${secondsAngle} 50 50)`}
        />

        <circle cx="50" cy="50" r="3" fill="#000" />
      </svg>

      <div style={{ marginTop: 20, fontSize: 24 }}>
        {displayMin}分 {displaySec.toString().padStart(2, "0")}秒
      </div>
    </div>
  );
}

