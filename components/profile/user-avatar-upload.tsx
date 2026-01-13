"use client"

import { useState } from "react"
import { Upload, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface UserAvatarUploadProps {
    currentAvatar?: string | null
    userName: string
    userId: string
    onUploadComplete: (url: string) => void
}

export function UserAvatarUpload({ currentAvatar, userName, userId, onUploadComplete }: UserAvatarUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState(currentAvatar)
    const supabase = createClient()

    const handleUpload = async (file: File) => {
        setUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${userId}-${Date.now()}.${fileExt}`

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, { upsert: true })

            if (error) throw error

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName)

            setPreview(publicUrl)
            onUploadComplete(publicUrl)
            toast.success("Avatar uploaded successfully!")
        } catch (error: any) {
            console.error('Upload error:', error)
            toast.error(`Failed to upload avatar: ${error.message}`)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative group">
                <div className="w-32 h-32 rounded-full border-4 border-white/20 bg-white/5 overflow-hidden">
                    <img
                        src={preview || `https://i.pravatar.cc/150?u=${userName}`}
                        alt={userName}
                        className="w-full h-full object-cover"
                    />
                </div>

                <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                                // Show preview immediately
                                const reader = new FileReader()
                                reader.onloadend = () => {
                                    setPreview(reader.result as string)
                                }
                                reader.readAsDataURL(file)
                                handleUpload(file)
                            }
                        }}
                        disabled={uploading}
                    />
                    <div className="flex flex-col items-center gap-1">
                        <Camera size={24} className="text-white" />
                        <span className="text-xs text-white font-medium">
                            {uploading ? "Uploading..." : "Change Photo"}
                        </span>
                    </div>
                </label>
            </div>
        </div>
    )
}
