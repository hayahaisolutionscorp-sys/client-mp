"use client";

import { useThemeSettings } from "@/hooks/theme-settings";
import { Jost, Roboto, League_Spartan, Mountains_of_Christmas, Great_Vibes, Henny_Penny, Rubik_Gemstones, Inter } from "next/font/google";

// Define fonts and explicitly set the weight where required
const jost = Jost({ subsets: ["latin"], variable: "--font-jost" });
const roboto = Roboto({ subsets: ["latin"], weight: "400", variable: "--font-roboto" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const leagueSpartan = League_Spartan({ subsets: ["latin"], variable: "--font-league-spartan" });
const mountainsOfChristmas = Mountains_of_Christmas({ subsets: ["latin"], weight: "400", variable: "--font-mountains" });
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--font-great-vibes" });
const hennyPenny = Henny_Penny({ subsets: ["latin"], weight: "400", variable: "--font-henny-penny" });
const rubikGemstones = Rubik_Gemstones({ subsets: ["latin"], weight: "400", variable: "--font-rubik-gemstones" });

export default function BodyWrapper({ children }: { children: React.ReactNode }) {
  const themeSettings = useThemeSettings();
  const fontStyle = themeSettings?.fontStyle?.trim();

  return (
    <div
      className={
        fontStyle === "roboto" ? roboto.className :
          fontStyle === "leagueSpartan" ? leagueSpartan.className :
            fontStyle === "mountainsOfChristmas" ? mountainsOfChristmas.className :
              fontStyle === "greatVibes" ? greatVibes.className :
                fontStyle === "hennyPenny" ? hennyPenny.className :
                  fontStyle === "rubikGemstones" ? rubikGemstones.className :
                    fontStyle === "jost" ? jost.className :
                      inter.className // Default to Inter
      }
    >

      {children}
    </div>
  );
}
