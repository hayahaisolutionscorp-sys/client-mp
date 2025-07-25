"use client";

import { useState } from "react";
import { BsStars } from "react-icons/bs";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const DiscountCoupon = () => {
  const [coupon, setCoupon] = useState<string>("")
  const [discountApplied, setDiscountApplied] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>("")

  const handleApplyCoupon = () => {
    setIsLoading(true); // Start loading state
    setErrorMessage(""); // Clear previous error

    // Simulate a network request or validation logic
    setTimeout(() => {
      if (coupon === "TEST-61") {
        setDiscountApplied(true);
      } else {
        setDiscountApplied(false);
        setErrorMessage("Invalid coupon code. Please try again.")
      }

      setIsLoading(false); // End loading state
    }, 1000); // Simulate delay (replace with actual API call if needed)
  };

  return (
    <div className="space-y-4 mt-6">
      {/* Discount message */}
      {discountApplied && (
        <div className="flex flex-col items-start border bg-green-100 p-4 rounded-lg mb-4">
          <div className="flex text-lg font-semibold text-green-800 mb-2">
            <BsStars className="w-6 h-6 mr-2" />
            <span>Discount</span>
          </div>

          <p className="text-base text-customText ml-8">
            Hey, you have a 
            <span className="font-semibold"> PHP 300 </span>
            discount using coupon code applied.
          </p>
        </div>
      )}

      {/* Error message */}
      {errorMessage && (
        <div className="flex items-start border bg-red-100 text-red-800 p-4 rounded-lg mb-4">
          <AiOutlineCheckCircle className="w-6 h-6 mr-2" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Offer & Discount */}
      <div className="flex flex-col items-start border p-4 rounded-lg bg-white shadow-md space-y-2">
        {/* Label */}
        <label htmlFor="coupon" className="text-lg font-semibold">
          Offer & Discount
        </label>

        {/* Input and Button */}
        <div className="flex items-center w-full space-x-4">
          <Input
            type="text"
            id="coupon"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder="Enter coupon code"
            className="border p-2 rounded-md flex-1"
        />
          <Button
            variant="default"
            disabled={isLoading} // Disable the button while loading
            onClick={handleApplyCoupon}
          >
            {isLoading ? <span>Applying...</span> : "Apply"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DiscountCoupon;