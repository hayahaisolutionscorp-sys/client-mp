"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

const slides = [
  { image: '/assets/photogrid/palompon.png', title: 'Palompon, Leyte' },
  { image: '/assets/photogrid/camotes.jpg', title: 'Camotes Island, Cebu' },
  { image: '/assets/photogrid/coron.png', title: 'Coron, Palawan' },
  { image: '/assets/photogrid/el-nido.png', title: 'El Nido, Palawan' },
  { image: '/assets/photogrid/isabel.png', title: 'Isabel, Leyte' },
  { image: '/assets/photogrid/mactan.png', title: 'Mactan, Cebu' },
  { image: '/assets/photogrid/santa-fe.png', title: 'Santa Fe, Bantayan' },
  { image: '/assets/photogrid/kawit.png', title: 'Kawit Medellin' },
]

export function AuthSidebar() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative hidden bg-blue-500 md:block md:rounded-l-3xl overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={slides[currentSlide].image || "/placeholder.svg"}
          alt={slides[currentSlide].title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-blue-500/20" />
      </div>
      <div className="relative flex h-full flex-col items-center justify-center p-6 text-center text-white">
        <h2 className="mb-2 text-2xl font-bold">{slides[currentSlide].title}</h2>
        <p className="mb-6 text-3xl font-bold">Quick, Easy Booking & Reach Your Destination with Ease</p>
        <p className="text-xl">Kay Ang Pagsakay, Dapat AYAHAY!</p>
        <div className="mt-8 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                currentSlide === index ? "bg-white" : "bg-white/50"
              }`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
