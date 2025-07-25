"use client";

import { useState, useEffect } from "react";

interface TimePickerProps {
  selectedTime: Date;
  onChange: (time: Date) => void;
}

const TimePicker = ({ selectedTime, onChange }: TimePickerProps) => {
  const [hour, setHour] = useState(selectedTime.getHours());
  const [minute, setMinute] = useState(selectedTime.getMinutes());
  const [isAM, setIsAM] = useState(hour < 12);

  useEffect(() => {
    const updatedHour = isAM ? hour % 12 : (hour % 12) + 12;
    const updatedTime = new Date(selectedTime);
    updatedTime.setHours(updatedHour, minute);
    onChange(updatedTime);
  }, [hour, minute, isAM, onChange, selectedTime]); // Added onChange and selectedTime to dependencies

  const toggleAM = () => {
    if (!isAM) {
      setIsAM(true);
      setHour(hour % 12);
    }
  };

  const togglePM = () => {
    if (isAM) {
      setIsAM(false);
      setHour((hour % 12) + 12);
    }
  };

  const formatTime = (value: number) => (value < 10 ? `0${value}` : value);

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-1">
        {/* Hour Dropdown */}
        <select
          className="text-sm w-16 p-2 border rounded-md text-center"
          value={hour % 12 === 0 ? 12 : hour % 12}
          onChange={(e) => {
            const selectedHour = Number(e.target.value);
            setHour(selectedHour === 12 ? (isAM ? 0 : 12) : selectedHour + (isAM ? 0 : 12));
          }}
        >
          {Array.from({ length: 12 }, (_, index) => {
            const displayHour = index === 0 ? 12 : index; // Display 12 instead of 0
            return (
              <option key={index} value={displayHour}>
                {formatTime(displayHour)}
              </option>
            );
          })}
        </select>

        <span className="text-sm">:</span>

        {/* Minute Dropdown */}
        <select
          className="text-sm w-16 p-2 border rounded-md text-center"
          value={minute}
          onChange={(e) => setMinute(Number(e.target.value))}
        >
          {Array.from({ length: 60 }, (_, index) => (
            <option key={index} value={index}>
              {formatTime(index)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={toggleAM}
          className={`text-sm w-12 p-2 border rounded-md ${
            isAM ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
          }`}
        >
          AM
        </button>
        <button
          onClick={togglePM}
          className={`text-sm w-12 p-2 border rounded-md ${
            !isAM ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
          }`}
        >
          PM
        </button>
      </div>
    </div>
  );
};

export default TimePicker;