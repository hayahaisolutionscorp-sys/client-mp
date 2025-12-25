'use client'

import Image from "next/image";
import React from "react";
import dynamic from 'next/dynamic';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

interface MediaProps {
  src: string;
  type: "image" | "video" | "youtube";
  alt?: string;
  controls?: boolean;
  playing?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  className?: string;
}

export default function Media({
  src,
  type,
  alt = "media",
  controls = true,
  playing = false,
  autoPlay = false,
  loop = false,
  muted = false,
  className = "",
}: MediaProps) {
  if (type === "image") {
    return <Image src={src} alt={alt} layout="fill" className={className} />;
  }

  if (type === "youtube") {
    return <ReactPlayer url={src} width="100%" height="100%" playing={playing} loop={loop} muted={muted} controls={controls} className={className} />;
  }

  if (type === "video") {
    return (
      <video src={src} autoPlay={autoPlay} loop={loop} muted={muted} playsInline className={className}></video>
    );
  }

  return null;
};
