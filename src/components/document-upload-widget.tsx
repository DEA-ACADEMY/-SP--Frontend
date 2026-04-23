import { useRef, useState } from "react";
import { FileText, UploadCloud, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export function getDocumentFileName(url?: string | null) {
    if (!url) return "";

    try {
        const parsed = new URL(url);
        const lastPart = parsed.pathname.split("/").filter(Boolean).pop() ?? "";
        return decodeURIComponent(lastPart) || url;
    } catch {
        const lastPart = url.split("/").filter(Boolean).pop() ?? "";
        return decodeURIComponent(lastPart) || url;
    }
}

export function getCloudinaryDownloadUrl(url?: string | null) {
    if (!url) return "";

    if (!url.includes("/upload/")) return url;

    return url.replace("/upload/", "/upload/fl_attachment/");
}

type CloudinaryDocumentUploadProps = {
    value?: string;
    onChange: (url: string) => void;
    folder?: string;
    disabled?: boolean;
};

type CloudinaryUploadResponse = {
    secure_url: string;
    original_filename?: string;
};

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export function CloudinaryDocumentUpload({
    value,
    onChange,
    folder = "snowball/documents",
    disabled = false,
}: CloudinaryDocumentUploadProps) {
    const { t } = useTranslation();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState("");

    async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        setError(null);

        const maxSizeMb = 25;
        if (file.size > maxSizeMb * 1024 * 1024) {
            setError(t("upload.errors.tooLarge", { size: maxSizeMb }));
            return;
        }

        if (!CLOUD_NAME || !UPLOAD_PRESET) {
            setError(t("upload.errors.missingCloudinary"));
            return;
        }

        try {
            setUploading(true);

            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", UPLOAD_PRESET);
            formData.append("folder", folder);

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
                {
                    method: "POST",
                    body: formData,
                },
            );

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || t("upload.errors.uploadFailed"));
            }

            const data = (await response.json()) as CloudinaryUploadResponse;
            setFileName(file.name || data.original_filename || "");
            onChange(data.secure_url);
        } catch (err: any) {
            setError(err?.message || t("upload.errors.failed"));
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    }

    return (
        <div className="space-y-2 rounded-md border bg-muted/20 p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-background text-muted-foreground">
                        <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                            {value ? fileName || getDocumentFileName(value) || t("upload.documentReady") : t("upload.noDocument")}
                        </div>
                        {value ? (
                            <a
                                href={value}
                                target="_blank"
                                rel="noreferrer"
                                className="block truncate text-xs text-muted-foreground underline"
                            >
                                {value}
                            </a>
                        ) : (
                            <div className="text-xs text-muted-foreground">
                                {t("upload.documentHint")}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => inputRef.current?.click()}
                        disabled={disabled || uploading}
                    >
                        <UploadCloud className="h-4 w-4" />
                        {uploading ? t("upload.uploading") : t("upload.uploadDocument")}
                    </Button>
                    {value ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setFileName("");
                                onChange("");
                            }}
                            disabled={disabled || uploading}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    ) : null}
                </div>
            </div>

            <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                disabled={disabled || uploading}
            />

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
    );
}
