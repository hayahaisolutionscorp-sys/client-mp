"use client"

import * as React from "react"
import { Button } from "./Button"

const ButtonShowcase = () => {
  return (
    <div>
      <h1>Button Showcase</h1>
      <div className="flex gap-4 items-start">
        {/* Showcase default variant */}
        <Button variant="default">Default Button</Button>
        
        {/* Showcase destructive variant */}
        <Button variant="destructive">Destructive Button</Button>
        
        {/* Showcase outline variant */}
        <Button variant="outline">Outline Button</Button>
        
        {/* Showcase secondary variant */}
        <Button variant="secondary">Secondary Button</Button>
        
        {/* Showcase ghost variant */}
        <Button variant="ghost">Ghost Button</Button>
        
        {/* Showcase link variant */}
        <Button variant="link">Link Button</Button>
        
        {/* Showcase different sizes */}
        <Button size="sm">Small Button</Button>
        <Button size="default">Default Size Button</Button>
        <Button size="lg">Large Button</Button>
        <Button size="icon">Icon Button</Button>
      </div>
    </div>
  )
}

export default ButtonShowcase 