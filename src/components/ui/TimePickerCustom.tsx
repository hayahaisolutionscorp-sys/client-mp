"use client";

import { useState, useEffect } from "react";

import { MINUTE_OPTIONS } from "constants/default"

interface TimePickerProps {
  selectedTime: Date;
  onChange: (time: Date) => void;
}

const TimePicker = ({ selectedTime, onChange }: TimePickerProps) => {
  const [hour, setHour] = useState(selectedTime.getHours() % 12 || 12); // Adjust the hour display logic
  const [minute, setMinute] = useState(selectedTime.getMinutes());
  const [isAM, setIsAM] = useState(selectedTime.getHours() < 12);

  useEffect(() => {
    // Only update the time if the hour or minute actually changes
    const updatedHour = isAM ? (hour % 12) : (hour % 12) + 12;
    const updatedTime = new Date(selectedTime);
    updatedTime.setHours(updatedHour, minute);
    onChange(updatedTime);
  }, [hour, minute, isAM, selectedTime, onChange]); // Added onChange and selectedTime to dependencies

  const toggleAM = () => {
    if (!isAM) {
      setIsAM(true);
      setHour(hour === 12 ? 0 : hour); // Reset hour when toggling to AM
    }
  };

  const togglePM = () => {
    if (isAM) {
      setIsAM(false);
      setHour(hour === 12 ? 12 : hour); // Reset hour when toggling to PM
    }
  };

  const formatTime = (value: number) => (value < 10 ? `0${value}` : value);

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-1">
        {/* Hour Dropdown */}
        <select
          className="text-sm w-16 p-2 border rounded-md text-center"
          value={hour}
          onChange={(e) => {
            const selectedHour = Number(e.target.value);
            // Update the hour correctly for both AM/PM context
            setHour(selectedHour === 12 ? (isAM ? 0 : 12) : selectedHour);
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
          {MINUTE_OPTIONS.map((minuteOption) => (
            <option key={minuteOption} value={minuteOption}>
              {formatTime(minuteOption)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={toggleAM}
          className={`text-sm w-12 p-2 border rounded-md ${isAM ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
        >
          AM
        </button>
        <button
          onClick={togglePM}
          className={`text-sm w-12 p-2 border rounded-md ${!isAM ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
        >
          PM
        </button>
      </div>
    </div>
  );
};

export default TimePicker;