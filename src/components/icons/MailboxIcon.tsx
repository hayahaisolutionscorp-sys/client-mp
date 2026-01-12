import React from "react";

interface MailboxIconProps {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    className?: string;
}

export const MailboxIcon: React.FC<MailboxIconProps> = ({
    primaryColor = "#0C74B5", // Default blue
    secondaryColor = "#5BB7EF", // Default light blue
    accentColor = "#58DC88", // Default green (Flag)
    className,
}) => {

    return (
        <svg
            width="333"
            height="254"
            viewBox="0 0 333 254"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <g clipPath="url(#clip0_425_5516)">
                {/* Post base/lines - Neutral/Brownish in original, kept as is or themed? 
            Let's keep these neutral or use a derived color if needed. 
            For now, keeping original hexes for the post structure. 
        */}
                <path
                    d="M130.91 313.763H199.352C199.914 313.763 200.388 312.259 200.388 310.51V100.981C200.388 99.2214 199.914 97.7275 199.352 97.7275H130.91C130.598 97.7275 130.369 98.0659 130.197 98.602L130.187 98.7113C130.187 98.7113 130.166 98.7217 130.156 98.8206C129.948 99.5245 129.855 100.257 129.88 100.991V310.52C129.88 312.259 130.343 313.763 130.91 313.763Z"
                    fill="#DFAD92"
                />
                <path
                    d="M161.869 313.763H199.795C200.118 313.763 200.373 312.259 200.373 310.51V100.981C200.373 99.2214 200.112 97.7275 199.795 97.7275H161.875C161.703 97.7275 161.573 98.0659 161.49 98.602L161.479 98.7113C161.479 98.7113 161.469 98.7217 161.458 98.8206C161.341 99.5378 161.29 100.264 161.307 100.991V310.52C161.307 312.259 161.557 313.763 161.869 313.763Z"
                    fill="#A4806D"
                />
                <path
                    d="M130.911 223.379H199.332C199.904 223.379 200.378 223.057 200.378 222.677V176.915C200.378 176.53 199.904 176.197 199.332 176.197H130.9C130.656 176.19 130.414 176.257 130.208 176.389L130.177 176.41L130.135 176.441C130.056 176.491 129.989 176.56 129.943 176.642C129.897 176.724 129.872 176.816 129.87 176.91V222.671C129.87 223.062 130.323 223.379 130.9 223.379"
                    fill="#A4806D"
                />

                {/* Mailbox Body Back - Was #7C9C9F (Greenish Gray) -> Mapped to Secondary (Darker shade?) */}
                <path
                    d="M111.295 39.1406H52.4631C23.4973 39.1406 0 71.2654 0 110.88V198.333H58.8317V110.88C58.8317 71.2654 82.3134 39.1406 111.295 39.1406Z"
                    fill={secondaryColor}
                    style={{ opacity: 0.7 }} // Visual depth
                />

                {/* Mailbox Dark Shadow/Depth - Was #051036 -> Primary (Darkest) */}
                <path
                    d="M248.309 39.1406H111.295C82.3133 39.1406 58.8472 71.2654 58.8472 110.88V198.333H300.777V110.88C300.777 71.2654 277.29 39.1406 248.329 39.1406"
                    fill={primaryColor}
                />

                {/* Mailbox Main Body - Was #0C74B5 (Blue) -> Now Accent (Arch/Rim) */}
                <path
                    d="M120.973 39.1406H52.4734C23.5024 39.1406 0.0258789 71.2654 0.0258789 110.88V198.333H173.456V110.88C173.456 71.2654 149.97 39.1406 121.009 39.1406"
                    fill={accentColor}
                />

                {/* Flag - Was #58DC88 (Green) -> Accent */}
                <path
                    d="M335.825 129.072C335.846 129.103 335.971 129.114 335.971 129.145V191.932C335.979 192.154 335.929 192.375 335.825 192.572C335.825 192.572 335.804 192.572 335.804 192.582H335.784C335.716 192.713 335.591 192.827 335.445 192.827H301.464C301.162 192.827 300.928 192.4 300.928 191.875V157.694H197.719C196.59 157.694 195.611 157.491 195.611 157.267V129.088C195.611 128.843 196.59 128.65 197.719 128.65H335.445C335.601 128.65 335.742 128.807 335.825 129.02"
                    fill={"#F0F0F0"}
                />

                {/* Mailbox Highlight/Front - Was #5BB7EF (Light Blue) -> Secondary */}
                <path
                    d="M116.905 49.1348H55.4176C29.4215 49.1348 8.3252 79.212 8.3252 116.314V198.204H164.003V116.314C164.003 79.212 142.926 49.1348 116.905 49.1348Z"
                    fill={secondaryColor}
                />
            </g>
            <defs>
                <clipPath id="clip0_425_5516">
                    <rect width="333" height="254" fill="white" />
                </clipPath>
            </defs>
        </svg>
    );
};
