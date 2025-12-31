"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { QrCodeIcon, Share01Icon } from "@hugeicons/core-free-icons";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
// import { cn } from "@/lib/utils/utils";

interface WorkoutShareModalProps {
    workoutId: string;
    workoutName: string;
}

export function WorkoutShareModal({
    workoutId,
    workoutName,
}: WorkoutShareModalProps) {
    const [shareUrl, setShareUrl] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Generate URL on client side to ensure correct origin
        setShareUrl(`${window.location.origin}/s/${workoutId}`);
    }, [workoutId]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <HugeiconsIcon icon={QrCodeIcon} className="w-4 h-4" />
                    <span className="hidden sm:inline">Compartir QR</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Compartir "{workoutName}"</DialogTitle>
                    <DialogDescription>
                        Tus amigos pueden escanear este código para importar esta rutina.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center p-6 space-y-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border w-full max-w-[200px] sm:max-w-[250px] aspect-square flex items-center justify-center mx-auto">
                        {shareUrl && (
                            <QRCodeSVG
                                value={shareUrl}
                                size={256}
                                style={{ width: "100%", height: "100%" }}
                                level="H"
                                includeMargin
                                imageSettings={{
                                    src: "/icons/favicon-192x192.png",
                                    x: undefined,
                                    y: undefined,
                                    height: 35,
                                    width: 35,
                                    excavate: true,
                                }}
                            />
                        )}
                    </div>

                    <div className="w-full space-y-3">
                        <p className="text-xs font-medium text-center text-muted-foreground">
                            Escanea o comparte el enlace:
                        </p>
                        <div className="flex gap-2">
                            <Button
                                className="flex-1 gap-2"
                                variant="outline"
                                onClick={handleCopy}
                            >
                                <HugeiconsIcon icon={Share01Icon} className="w-4 h-4" />
                                {copied ? "Copiado" : "Copiar Enlace"}
                            </Button>
                            {typeof navigator !== "undefined" && navigator.share && (
                                <Button
                                    className="flex-1 gap-2"
                                    onClick={() => {
                                        navigator.share({
                                            title: `Rutina: ${workoutName}`,
                                            text: `¡Mira mi rutina ${workoutName} en GymRat+!`,
                                            url: shareUrl
                                        }).catch(console.error);
                                    }}
                                >
                                    Compartir
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
