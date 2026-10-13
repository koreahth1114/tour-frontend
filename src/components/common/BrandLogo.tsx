import { useState } from "react";
import brandSvg from "../../assets/site-logo.svg?raw";

// This SVG is a reviewed, bundled brand asset, never markup from an API.
// Inline paths paint with the header instead of waiting for an image decode.
export default function BrandLogo({ src, className }: { src: string; className: string }) {
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    if (src === "/site-logo.svg" || src === failedSrc) {
        return (
            <span
                role="img"
                aria-label="청원여행사"
                data-brand-logo="inline"
                className={`block shrink-0 [&>svg]:h-full [&>svg]:w-full ${className}`}
                style={{ aspectRatio: "180 / 40" }}
                dangerouslySetInnerHTML={{ __html: brandSvg }}
            />
        );
    }
    return (
        <img
            src={src}
            alt="청원여행사"
            data-brand-logo="configured"
            className={className}
            width={180}
            height={40}
            loading="eager"
            fetchPriority="high"
            onError={() => setFailedSrc(src)}
        />
    );
}
