import { Jost, Roboto, League_Spartan, Mountains_of_Christmas, Great_Vibes, Henny_Penny, Rubik_Gemstones } from "next/font/google";

// Define fonts and explicitly set the weight where required
export const jost = Jost({ subsets: ["latin"], variable: "--font-jost" });
export const roboto = Roboto({ subsets: ["latin"], weight: "400", variable: "--font-roboto" }); // Fix: Set weight to 400
export const leagueSpartan = League_Spartan({ subsets: ["latin"], variable: "--font-league-spartan" });
export const mountainsOfChristmas = Mountains_of_Christmas({ subsets: ["latin"], weight: "400", variable: "--font-mountains" }); // Fix: Set weight to 400
export const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--font-great-vibes" }); // Fix: Set weight to 400
export const hennyPenny = Henny_Penny({ subsets: ["latin"], weight: "400", variable: "--font-henny-penny" }); // Fix: Set weight to 400
export const rubikGemstones = Rubik_Gemstones({ subsets: ["latin"], weight: "400", variable: "--font-rubik-gemstones" }); // Fix: Set weight to 400

// Map fonts to CSS variables
export const fontOptions = {
  jost: jost.variable,
  roboto: roboto.variable,
  leagueSpartan: leagueSpartan.variable,
  mountainsOfChristmas: mountainsOfChristmas.variable,
  greatVibes: greatVibes.variable,
  hennyPenny: hennyPenny.variable,
  rubikGemstones: rubikGemstones.variable,
};
