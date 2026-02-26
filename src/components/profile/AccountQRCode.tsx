"use client"

import React, { useRef, useCallback, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Download, Maximize2 } from "lucide-react"
import { Button } from '@/components/ui/Button'
import { toPng } from 'html-to-image'
import { QRCodeDisplay } from "./QRCodeDisplayProps"
import { useThemeSettings } from '@/hooks/theme-settings'
import { useBranding } from '@/hooks/branding'
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/Dialog"
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface AccountQRCodeProps {
    qrCode: string;
    qrCodeId?: string;
    passengerName?: string;
}

export const AccountQRCode: React.FC<AccountQRCodeProps> = ({
    qrCode,
    qrCodeId,
    passengerName
}) => {
    const themeSettings = useThemeSettings();
    const branding = useBranding();
    const brandName = branding?.brand_name || 'Ayahay';
    const primaryColor = themeSettings?.primary || '#2563eb';
    const qrRef = useRef<HTMLDivElement>(null);
    const modalQrRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);

    const downloadQRCode = useCallback((ref: React.RefObject<HTMLDivElement>, filename: string) => {
        if (ref.current === null) {
            return;
        }

        toPng(ref.current, { 
            cacheBust: true,
            backgroundColor: undefined, // Set to undefined for transparent background
            style: {
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '24px',
            }
        })
        .then((dataUrl) => {
            const link = document.createElement('a');
            link.download = filename;
            link.href = dataUrl;
            link.click();
        })
        .catch((err) => {
            console.error('oops, something went wrong!', err);
        });
    }, []);

    const passContent = (ref: React.RefObject<HTMLDivElement>, size: number = 140, isModal: boolean = false) => (
        <div 
            ref={ref}
            className={cn(
                "bg-white rounded-2xl flex flex-col items-center justify-center transition-all duration-300 shrink-0 mx-auto overflow-hidden",
                isModal ? "p-6 md:p-8 shadow-2xl" : "p-6"
            )}
            style={{ 
                border: `4px solid ${primaryColor}`,
                boxShadow: isModal ? `0 20px 50px -12px ${primaryColor}30` : `0 10px 25px -5px ${primaryColor}20`,
                aspectRatio: isModal ? '9 / 16' : 'auto',
                height: isModal ? 'min(640px, 80vh)' : 'auto',
                width: isModal ? 'min(400px, 90vw)' : 'fit-content'
            }}
        >
            <div className="flex flex-col items-center flex-1 justify-center gap-4 w-full max-w-full overflow-hidden">
                 {isModal && (
                    <div className="items-centerw-full px-2">
                        <Image
                            src={branding?.logo?.dark || branding?.logo?.light || "/images/ayahay-logo.png"}
                            alt={`${brandName} Logo`}
                            height={150}
                            width={150}
                        />
                    </div>
                )}
                
                { isModal &&(qrCodeId || passengerName) && (
                    <div className={cn(
                        "text-center w-full pb-4 overflow-hidden",
                        isModal ? "border-b-2" : "border-b"
                    )} style={{ borderColor: `${primaryColor}15` }}>
                        {passengerName && (
                            <p className={cn(
                                "font-bold text-slate-900 truncate px-2 w-full",
                                isModal ? "text-xl md:text-2xl" : "text-sm"
                            )}>
                                {passengerName}
                            </p>
                        )}
                        {qrCodeId && (
                            <p className={cn(
                                "font-mono text-l text-slate-500 tracking-widest truncate px-2 w-full text-wrap",
                                isModal ? "text-l pb-2" : "text-[10px]"
                            )}>
                                ID: {qrCodeId}
                            </p>
                        )}
                    </div>
                )}

                <div className="relative bg-white p-3 rounded-xl border border-slate-100 shadow-sm shrink-0">
                    <QRCodeDisplay qr_code={qrCode} size={size} />
                </div>

            </div>
        </div>
    );

    return (
        <>
            <Card className="hover:shadow-md transition-shadow h-fit w-full overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between pb-0">
                    <div className="space-y-0.5">
                        <CardTitle className="text-lg font-bold">Account QR</CardTitle>
                        <CardDescription>Show this for faster OTC booking and boarding</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-start p-6 gap-8">
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <div className="relative cursor-zoom-in group/qr shrink-0">
                                {passContent(qrRef, 120)}
                                <div className="absolute inset-0 bg-black/0 group-hover/qr:bg-black/5 rounded-2xl transition-colors flex items-center justify-center">
                                    <Maximize2 className="h-5 w-5 text-white opacity-0 group-hover/qr:opacity-100 transition-opacity drop-shadow-md" />
                                </div>
                            </div>
                        </DialogTrigger>
                        <DialogContent hideClose className="sm:max-w-fit p-0 border-none bg-transparent shadow-none gap-0 overflow-hidden flex flex-col items-center justify-center max-h-[98vh] outline-none">
                            <DialogHeader className="sr-only">
                                <DialogTitle>{brandName} Account QR</DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-col items-center justify-center p-4 w-full">
                                {passContent(modalQrRef, 300, true)}
                                
                                <div className="mt-6 w-full max-w-[400px] px-2">
                                    <Button 
                                        variant="outline" 
                                        className="w-full bg-white border-white/20 hover:bg-slate-50 gap-2 h-14 text-base font-bold shadow-2xl transition-all hover:scale-[1.02] rounded-xl"
                                        onClick={() => downloadQRCode(modalQrRef, `${brandName}-account-qr-${qrCodeId || 'code'}.png`)}
                                        style={{ color: primaryColor }}
                                    >
                                        <Download className="h-5 w-5" />
                                        Save Account QR
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

    
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => downloadQRCode(qrRef, `${brandName}-account-qr-${qrCodeId || 'code'}.png`)}
                        className="gap-2 text-xs font-semibold hover:bg-slate-50 transition-colors"
                        style={{ borderColor: `${primaryColor}30`, color: primaryColor }}
                    >
                        <Download className="h-3.5 w-3.5" />
                        Download Card
                    </Button>
                </CardContent>
            </Card>
        </>
    )
}

