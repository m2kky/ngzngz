"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export function BackToTop() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }

        window.addEventListener("scroll", toggleVisibility)
        return () => window.removeEventListener("scroll", toggleVisibility)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        })
    }

    if (!isVisible) return null

    return (
        <Button
            variant="default"
            size="icon"
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 rounded-full h-12 w-12 bg-[var(--brand)] hover:bg-[var(--brand)]/90 text-black shadow-lg shadow-[var(--brand)]/20 animate-in fade-in zoom-in duration-300"
        >
            <ArrowUp className="w-6 h-6" />
        </Button>
    )
}
