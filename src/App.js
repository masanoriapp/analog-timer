import React, { useState, useEffect, useRef } from "react";

export default function App() {
  const [inputMin, setInputMin] = useState("0");
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((sec) => {
          if (sec <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            return 0;
          }
          return sec - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const startTimer = () => {
    let min = parseInt(inputMin, 10);
    if (isNaN(min) || min <= 0 || min > 60) {
      alert("正しい分（1～60）を入力してください");
      return;
    }

    const total = min * 60;
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

  const inputMinutes = Math.min(Math.max(parseInt(inputMin, 10) || 0, 0), 60);
  const maxAngle = inputMinutes * 6; // 60分なら360度

  // 残り時間に応じた分針角度（反時計回り）
  const minutesAngle = totalSeconds
    ? maxAngle * (remainingSeconds / totalSeconds)
    : 0;

  const radius = 48;
  const centerX = 50;
  const centerY = 50;

  const polarToCartesian = (cx, cy, r, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x, y, radius, startAngle, endAngle) => {
    const start = polarToCartesian(x, y, radius, startAngle);
    const end = polarToCartesian(x, y, radius, endAngle);

    let diff = startAngle - endAngle;
    if (diff < 0) diff += 360;

    const largeArcFlag = diff > 180 ? 1 : 0;

    // sweep-flag = 0 → 反時計回り
    return [
      `M ${x} ${y}`,
      `L ${start.x} ${start.y}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
      "Z",
    ].join(" ");
  };

  const shouldDrawArc = inputMinutes > 0 && remainingSeconds > 0;
  const arcPath = shouldDrawArc
    ? describeArc(centerX, centerY, radius, minutesAngle, 0) // 分針→12時 方向に描画
    : null;

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
      }}
    >
      <h1>うえタイマー</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          type="number"
          min="1"
          max="60"
          value={inputMin}
          onChange={(e) => setInputMin(e.target.value)}
          style={{ width: 50 }}
          disabled={isRunning}
        />
        <span style={{ marginLeft: 5 }}>分</span>
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
        {/* 時計盤の白い円 */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="#fff"
          stroke="#000"
          strokeWidth="2"
        />

        {/* 赤い扇形（分針→12時の間） */}
        {shouldDrawArc && <path d={arcPath} fill="rgba(255,0,0,0.6)" />}

        {/* 12個の目盛り */}
        {[...Array(12)].map((_, i) => {
          const minute = i * 5;
          const angle = (minute * 6 - 90) * (Math.PI / 180);
          const radiusText = 42;
          const x = 50 + radiusText * Math.cos(angle);
          const y = 50 + radiusText * Math.sin(angle);
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

        {/* 分針（赤色） */}
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="20"
          stroke="red"
          strokeWidth="3"
          strokeLinecap="round"
          transform={`rotate(${minutesAngle} 50 50)`}
        />

        {/* 中心の丸 */}
        <circle cx="50" cy="50" r="3" fill="#000" />
      </svg>

      <div style={{ marginTop: 20, fontSize: 24 }}>
        {displayMin}分 {displaySec.toString().padStart(2, "0")}秒
      </div>
    </div>
  );
}
