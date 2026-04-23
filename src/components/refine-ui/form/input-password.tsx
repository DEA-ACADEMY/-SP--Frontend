"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/components/refine-ui/language/language-provider";

type InputPasswordProps = React.ComponentProps<"input">;

export const InputPassword = ({ className, ...props }: InputPasswordProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const { dir } = useLanguage();

    return (
        <div className="relative">
            <Input
                type={showPassword ? "text" : "password"}
                className={cn(
                    dir === "rtl" ? "pl-10" : "pr-10",
                    className,
                )}
                {...props}
            />

            <button
                type="button"
                className={cn(
                    "absolute top-1/2 -translate-y-1/2 appearance-none",
                    dir === "rtl" ? "left-3" : "right-3",
                )}
                onClick={() => setShowPassword((prev) => !prev)}
            >
                {showPassword ? (
                    <EyeOff size={18} className="text-muted-foreground" />
                ) : (
                    <Eye size={18} className="text-muted-foreground" />
                )}
            </button>
        </div>
    );
};

InputPassword.displayName = "InputPassword";
