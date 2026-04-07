"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useBranding } from "@/hooks/branding"
import { useTheme } from "@/components/ThemeProvider"
import { useThemeSettings } from "@/hooks/theme-settings"

type AuthSidebarVariant = "default" | "image" | "testimonial" | "gradient";

interface AuthSidebarProps {
  variant?: AuthSidebarVariant;
  embedded?: boolean;
  tone?: "default" | "brand" | "editorial";
}

export function AuthSidebar({ variant = "default", embedded = false, tone = "brand" }: AuthSidebarProps) {
  const { destinations } = useTheme();
  const theme = useThemeSettings();
  const [currentSlide, setCurrentSlide] = useState(0)
  
  const defaultSlides = [
    { image: '/assets/photogrid/palompon.png', title: 'Palompon, Leyte' },
    { image: '/assets/photogrid/camotes.jpg', title: 'Camotes Island, Cebu' },
    { image: '/assets/photogrid/coron.png', title: 'Coron, Palawan' },
    { image: '/assets/photogrid/el-nido.png', title: 'El Nido, Palawan' },
    { image: '/assets/photogrid/isabel.png', title: 'Isabel, Leyte' },
    { image: '/assets/photogrid/mactan.png', title: 'Mactan, Cebu' },
    { image: '/assets/photogrid/santa-fe.png', title: 'Santa Fe, Bantayan' },
    { image: '/assets/photogrid/kawit.png', title: 'Kawit Medellin' },
  ];

  const slides = destinations && destinations.length > 0
    ? destinations.map(d => ({ image: d.image_url, title: d.image_alt || d.route }))
    : defaultSlides;

  const [slogan, setSlogan] = useState("Kay Ang Pagsakay, Dapat AYAHAY!")
  const branding = useBranding()
  const primaryColor = theme?.primaryColor || theme?.primary || "#0ea5e9";
  const secondaryColor = theme?.secondaryColor || theme?.secondary || "#38bdf8";
  const accentColor = theme?.accent || "#0f172a";
  const surfaceColor = theme?.surface || "#ffffff";
  const surfaceAltColor = theme?.surfaceAlt || "#eef8fc";

  useEffect(() => {
    if (branding?.slogan) {
      setSlogan(branding.slogan)
    }
  }, [branding])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  return (
    <div
      className={
        embedded
          ? "relative h-64 w-full overflow-hidden rounded-[28px] md:h-80"
          : "relative hidden h-full overflow-hidden md:block md:rounded-l-3xl"
      }
    >
      {variant === "gradient" ? (
        <div
          className="flex h-full flex-col justify-between p-8 text-white"
          style={{
            background: tone === "editorial"
              ? `linear-gradient(135deg, ${accentColor}, ${primaryColor})`
              : `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
          }}
        >
          <div className="space-y-4">
            <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]">
              {slides[currentSlide]?.title || "Ayahay"}
            </div>
            <h2 className="max-w-sm text-3xl font-bold leading-tight">Sign in with a cleaner, more focused flow.</h2>
            <p className="max-w-md text-sm text-white/80">{slogan}</p>
          </div>
          <div className="space-y-3 text-sm text-white/85">
            <p>Fast access to bookings, account settings, and trip history.</p>
            <div className="flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 w-2 rounded-full transition-colors duration-300 ${currentSlide === index ? "bg-white" : "bg-white/40"}`}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      ) : variant === "testimonial" ? (
        <div
          className="flex h-full items-center p-8 text-white"
          style={{
            background: tone === "editorial"
              ? `linear-gradient(160deg, ${accentColor} 0%, ${surfaceColor} 140%)`
              : `linear-gradient(160deg, ${accentColor} 0%, ${primaryColor} 120%)`,
          }}
        >
          <div className="space-y-6">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
              Trusted by travelers
            </div>
            <blockquote className="max-w-sm text-3xl font-semibold leading-tight">
              "{slogan}"
            </blockquote>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-sm text-white/70">Smooth sign in, faster booking access, and a cleaner premium experience.</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="absolute inset-0 h-full w-full">
            <Image
              src={slides[currentSlide]?.image || "/placeholder.svg"}
              alt={slides[currentSlide]?.title || "Destination"}
              fill
              className="object-cover object-center"
              priority
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  tone === "editorial"
                    ? `linear-gradient(180deg, color-mix(in srgb, ${accentColor} 50%, transparent), color-mix(in srgb, ${surfaceAltColor} 12%, transparent))`
                    : `linear-gradient(180deg, color-mix(in srgb, ${primaryColor} 44%, transparent), color-mix(in srgb, ${accentColor} 16%, transparent))`,
              }}
            />
          </div>
          <div className="relative flex h-full flex-col items-center justify-center p-6 text-center text-white">
            <h2 className="mb-2 text-2xl font-bold">{slides[currentSlide]?.title}</h2>
            <p className="mb-6 text-3xl font-bold">Quick, Easy Booking & Reach Your Destination with Ease</p>
            <p className="text-xl">{slogan}</p>
            <div className="mt-8 flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 w-2 rounded-full transition-colors duration-300 ${currentSlide === index ? "bg-white" : "bg-white/50"
                    }`}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
