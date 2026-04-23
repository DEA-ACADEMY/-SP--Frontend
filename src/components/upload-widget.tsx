import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

type CloudinaryImageUploadProps = {
    value?: string;
    onChange: (url: string) => void;
    folder?: string;
    disabled?: boolean;
    layout?: "row" | "column";
    previewClassName?: string;
};

type CloudinaryUploadResponse = {
    secure_url: string;
    public_id: string;
    resource_type: string;
};

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export function CloudinaryImageUpload({
                                          value,
                                          onChange,
                                          folder = "snowball/profiles",
                                          disabled = false,
                                          layout = "column",
                                      previewClassName = "h-28 w-28 rounded-full",
                                  }: CloudinaryImageUploadProps) {
    const { t } = useTranslation();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);

        if (!file.type.startsWith("image/")) {
            setError(t("upload.errors.imageOnly"));
            return;
        }

        const maxSizeMb = 5;
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
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
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
            onChange(data.secure_url);
        } catch (err: any) {
            setError(err?.message || t("upload.errors.failed"));
        } finally {
            setUploading(false);
            if (inputRef.current) {
                inputRef.current.value = "";
            }
        }
    }

    const isColumn = layout === "column";

    return (
        <div className="space-y-3">
            <div
                className={
                    isColumn
                        ? "flex flex-col items-center gap-3"
                        : "flex items-center gap-4"
                }
            >
                <div
                    className={`overflow-hidden border bg-muted shadow-sm ${previewClassName}`}
                >
                    {value ? (
                        <img
                            src={value}
                            alt={t("upload.profileAlt")}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                            {t("upload.noImage")}
                        </div>
                    )}
                </div>

                <div
                    className={
                        isColumn
                            ? "flex w-full flex-col items-center gap-2"
                            : "flex flex-col gap-2"
                    }
                >
                    <Button
                        type="button"
                        variant="outline"
                        className="min-w-[140px] rounded-full"
                        onClick={() => inputRef.current?.click()}
                        disabled={disabled || uploading}
                    >
                        {uploading ? t("upload.uploading") : t("upload.uploadImage")}
                    </Button>

                    {value ? (
                        <Button
                            type="button"
                            variant="ghost"
                            className="rounded-full text-muted-foreground"
                            onClick={() => onChange("")}
                            disabled={disabled || uploading}
                        >
                            {t("upload.remove")}
                        </Button>
                    ) : null}
                </div>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={disabled || uploading}
            />

            {error ? (
                <p className="text-center text-sm text-destructive">{error}</p>
            ) : null}
        </div>
    );
}
