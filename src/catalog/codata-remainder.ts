// The remaining 155 rows of the CODATA 2022 fundamental physical constants table not
// covered by the initial CODATA_DRAFT_COUNT=200 import — parsed once from data/codata-2022.txt
// (the official NIST ASCII table, same source as the first batch) and embedded as a literal so
// the admin seed route has no runtime filesystem dependency. Indices continue where the first
// batch left off (index 200 onward), so codataRegistryNumber(200 + i) assigns LR-001200 upward.
import type { CodataConstant } from "./codata";

export const CODATA_REMAINDER: CodataConstant[] = [
  {
    "quantity": "molar volume of silicon",
    "value": "1.205 883 199 e-5",
    "uncertainty": "0.000 000 060 e-5",
    "unit": "m^3 mol^-1"
  },
  {
    "quantity": "Molybdenum x unit",
    "value": "1.002 099 52 e-13",
    "uncertainty": "0.000 000 53 e-13",
    "unit": "m"
  },
  {
    "quantity": "muon Compton wavelength",
    "value": "1.173 444 110 e-14",
    "uncertainty": "0.000 000 026 e-14",
    "unit": "m"
  },
  {
    "quantity": "muon-electron mass ratio",
    "value": "206.768 2827",
    "uncertainty": "0.000 0046",
    "unit": ""
  },
  {
    "quantity": "muon g factor",
    "value": "-2.002 331 841 23",
    "uncertainty": "0.000 000 000 82",
    "unit": ""
  },
  {
    "quantity": "muon mag. mom.",
    "value": "-4.490 448 30 e-26",
    "uncertainty": "0.000 000 10 e-26",
    "unit": "J T^-1"
  },
  {
    "quantity": "muon mag. mom. anomaly",
    "value": "1.165 920 62 e-3",
    "uncertainty": "0.000 000 41 e-3",
    "unit": ""
  },
  {
    "quantity": "muon mag. mom. to Bohr magneton ratio",
    "value": "-4.841 970 48 e-3",
    "uncertainty": "0.000 000 11 e-3",
    "unit": ""
  },
  {
    "quantity": "muon mag. mom. to nuclear magneton ratio",
    "value": "-8.890 597 04",
    "uncertainty": "0.000 000 20",
    "unit": ""
  },
  {
    "quantity": "muon mass",
    "value": "1.883 531 627 e-28",
    "uncertainty": "0.000 000 042 e-28",
    "unit": "kg"
  },
  {
    "quantity": "muon mass energy equivalent",
    "value": "1.692 833 804 e-11",
    "uncertainty": "0.000 000 038 e-11",
    "unit": "J"
  },
  {
    "quantity": "muon mass energy equivalent in MeV",
    "value": "105.658 3755",
    "uncertainty": "0.000 0023",
    "unit": "MeV"
  },
  {
    "quantity": "muon mass in u",
    "value": "0.113 428 9257",
    "uncertainty": "0.000 000 0025",
    "unit": "u"
  },
  {
    "quantity": "muon molar mass",
    "value": "1.134 289 258 e-4",
    "uncertainty": "0.000 000 025 e-4",
    "unit": "kg mol^-1"
  },
  {
    "quantity": "muon-neutron mass ratio",
    "value": "0.112 454 5168",
    "uncertainty": "0.000 000 0025",
    "unit": ""
  },
  {
    "quantity": "muon-proton mag. mom. ratio",
    "value": "-3.183 345 146",
    "uncertainty": "0.000 000 071",
    "unit": ""
  },
  {
    "quantity": "muon-proton mass ratio",
    "value": "0.112 609 5262",
    "uncertainty": "0.000 000 0025",
    "unit": ""
  },
  {
    "quantity": "muon-tau mass ratio",
    "value": "5.946 35 e-2",
    "uncertainty": "0.000 40 e-2",
    "unit": ""
  },
  {
    "quantity": "natural unit of action",
    "value": "1.054 571 817... e-34",
    "uncertainty": "(exact)",
    "unit": "J s"
  },
  {
    "quantity": "natural unit of action in eV s",
    "value": "6.582 119 569... e-16",
    "uncertainty": "(exact)",
    "unit": "eV s"
  },
  {
    "quantity": "natural unit of energy",
    "value": "8.187 105 7880 e-14",
    "uncertainty": "0.000 000 0026 e-14",
    "unit": "J"
  },
  {
    "quantity": "natural unit of energy in MeV",
    "value": "0.510 998 950 69",
    "uncertainty": "0.000 000 000 16",
    "unit": "MeV"
  },
  {
    "quantity": "natural unit of length",
    "value": "3.861 592 6744 e-13",
    "uncertainty": "0.000 000 0012 e-13",
    "unit": "m"
  },
  {
    "quantity": "natural unit of mass",
    "value": "9.109 383 7139 e-31",
    "uncertainty": "0.000 000 0028 e-31",
    "unit": "kg"
  },
  {
    "quantity": "natural unit of momentum",
    "value": "2.730 924 534 46 e-22",
    "uncertainty": "0.000 000 000 85 e-22",
    "unit": "kg m s^-1"
  },
  {
    "quantity": "natural unit of momentum in MeV/c",
    "value": "0.510 998 950 69",
    "uncertainty": "0.000 000 000 16",
    "unit": "MeV/c"
  },
  {
    "quantity": "natural unit of time",
    "value": "1.288 088 666 44 e-21",
    "uncertainty": "0.000 000 000 40 e-21",
    "unit": "s"
  },
  {
    "quantity": "natural unit of velocity",
    "value": "299 792 458",
    "uncertainty": "(exact)",
    "unit": "m s^-1"
  },
  {
    "quantity": "neutron Compton wavelength",
    "value": "1.319 590 903 82 e-15",
    "uncertainty": "0.000 000 000 67 e-15",
    "unit": "m"
  },
  {
    "quantity": "neutron-electron mag. mom. ratio",
    "value": "1.040 668 84 e-3",
    "uncertainty": "0.000 000 24 e-3",
    "unit": ""
  },
  {
    "quantity": "neutron-electron mass ratio",
    "value": "1838.683 662 00",
    "uncertainty": "0.000 000 74",
    "unit": ""
  },
  {
    "quantity": "neutron g factor",
    "value": "-3.826 085 52",
    "uncertainty": "0.000 000 90",
    "unit": ""
  },
  {
    "quantity": "neutron gyromag. ratio",
    "value": "1.832 471 74 e8",
    "uncertainty": "0.000 000 43 e8",
    "unit": "s^-1 T^-1"
  },
  {
    "quantity": "neutron gyromag. ratio in MHz/T",
    "value": "29.164 6935",
    "uncertainty": "0.000 0069",
    "unit": "MHz T^-1"
  },
  {
    "quantity": "neutron mag. mom.",
    "value": "-9.662 3653 e-27",
    "uncertainty": "0.000 0023 e-27",
    "unit": "J T^-1"
  },
  {
    "quantity": "neutron mag. mom. to Bohr magneton ratio",
    "value": "-1.041 875 65 e-3",
    "uncertainty": "0.000 000 25 e-3",
    "unit": ""
  },
  {
    "quantity": "neutron mag. mom. to nuclear magneton ratio",
    "value": "-1.913 042 76",
    "uncertainty": "0.000 000 45",
    "unit": ""
  },
  {
    "quantity": "neutron mass",
    "value": "1.674 927 500 56 e-27",
    "uncertainty": "0.000 000 000 85 e-27",
    "unit": "kg"
  },
  {
    "quantity": "neutron mass energy equivalent",
    "value": "1.505 349 765 14 e-10",
    "uncertainty": "0.000 000 000 76 e-10",
    "unit": "J"
  },
  {
    "quantity": "neutron mass energy equivalent in MeV",
    "value": "939.565 421 94",
    "uncertainty": "0.000 000 48",
    "unit": "MeV"
  },
  {
    "quantity": "neutron mass in u",
    "value": "1.008 664 916 06",
    "uncertainty": "0.000 000 000 40",
    "unit": "u"
  },
  {
    "quantity": "neutron molar mass",
    "value": "1.008 664 917 12 e-3",
    "uncertainty": "0.000 000 000 51 e-3",
    "unit": "kg mol^-1"
  },
  {
    "quantity": "neutron-muon mass ratio",
    "value": "8.892 484 08",
    "uncertainty": "0.000 000 20",
    "unit": ""
  },
  {
    "quantity": "neutron-proton mag. mom. ratio",
    "value": "-0.684 979 35",
    "uncertainty": "0.000 000 16",
    "unit": ""
  },
  {
    "quantity": "neutron-proton mass difference",
    "value": "2.305 574 61 e-30",
    "uncertainty": "0.000 000 67 e-30",
    "unit": "kg"
  },
  {
    "quantity": "neutron-proton mass difference energy equivalent",
    "value": "2.072 147 12 e-13",
    "uncertainty": "0.000 000 60 e-13",
    "unit": "J"
  },
  {
    "quantity": "neutron-proton mass difference energy equivalent in MeV",
    "value": "1.293 332 51",
    "uncertainty": "0.000 000 38",
    "unit": "MeV"
  },
  {
    "quantity": "neutron-proton mass difference in u",
    "value": "1.388 449 48 e-3",
    "uncertainty": "0.000 000 40 e-3",
    "unit": "u"
  },
  {
    "quantity": "neutron-proton mass ratio",
    "value": "1.001 378 419 46",
    "uncertainty": "0.000 000 000 40",
    "unit": ""
  },
  {
    "quantity": "neutron relative atomic mass",
    "value": "1.008 664 916 06",
    "uncertainty": "0.000 000 000 40",
    "unit": ""
  },
  {
    "quantity": "neutron-tau mass ratio",
    "value": "0.528 779",
    "uncertainty": "0.000 036",
    "unit": ""
  },
  {
    "quantity": "neutron to shielded proton mag. mom. ratio",
    "value": "-0.684 996 94",
    "uncertainty": "0.000 000 16",
    "unit": ""
  },
  {
    "quantity": "Newtonian constant of gravitation",
    "value": "6.674 30 e-11",
    "uncertainty": "0.000 15 e-11",
    "unit": "m^3 kg^-1 s^-2"
  },
  {
    "quantity": "Newtonian constant of gravitation over h-bar c",
    "value": "6.708 83 e-39",
    "uncertainty": "0.000 15 e-39",
    "unit": "(GeV/c^2)^-2"
  },
  {
    "quantity": "nuclear magneton",
    "value": "5.050 783 7393 e-27",
    "uncertainty": "0.000 000 0016 e-27",
    "unit": "J T^-1"
  },
  {
    "quantity": "nuclear magneton in eV/T",
    "value": "3.152 451 254 17 e-8",
    "uncertainty": "0.000 000 000 98 e-8",
    "unit": "eV T^-1"
  },
  {
    "quantity": "nuclear magneton in inverse meter per tesla",
    "value": "2.542 623 410 09 e-2",
    "uncertainty": "0.000 000 000 79 e-2",
    "unit": "m^-1 T^-1"
  },
  {
    "quantity": "nuclear magneton in K/T",
    "value": "3.658 267 7706 e-4",
    "uncertainty": "0.000 000 0011 e-4",
    "unit": "K T^-1"
  },
  {
    "quantity": "nuclear magneton in MHz/T",
    "value": "7.622 593 2188",
    "uncertainty": "0.000 000 0024",
    "unit": "MHz T^-1"
  },
  {
    "quantity": "Planck constant",
    "value": "6.626 070 15 e-34",
    "uncertainty": "(exact)",
    "unit": "J Hz^-1"
  },
  {
    "quantity": "Planck constant in eV/Hz",
    "value": "4.135 667 696... e-15",
    "uncertainty": "(exact)",
    "unit": "eV Hz^-1"
  },
  {
    "quantity": "Planck length",
    "value": "1.616 255 e-35",
    "uncertainty": "0.000 018 e-35",
    "unit": "m"
  },
  {
    "quantity": "Planck mass",
    "value": "2.176 434 e-8",
    "uncertainty": "0.000 024 e-8",
    "unit": "kg"
  },
  {
    "quantity": "Planck mass energy equivalent in GeV",
    "value": "1.220 890 e19",
    "uncertainty": "0.000 014 e19",
    "unit": "GeV"
  },
  {
    "quantity": "Planck temperature",
    "value": "1.416 784 e32",
    "uncertainty": "0.000 016 e32",
    "unit": "K"
  },
  {
    "quantity": "Planck time",
    "value": "5.391 247 e-44",
    "uncertainty": "0.000 060 e-44",
    "unit": "s"
  },
  {
    "quantity": "proton charge to mass quotient",
    "value": "9.578 833 1430 e7",
    "uncertainty": "0.000 000 0030 e7",
    "unit": "C kg^-1"
  },
  {
    "quantity": "proton Compton wavelength",
    "value": "1.321 409 853 60 e-15",
    "uncertainty": "0.000 000 000 41 e-15",
    "unit": "m"
  },
  {
    "quantity": "proton-electron mass ratio",
    "value": "1836.152 673 426",
    "uncertainty": "0.000 000 032",
    "unit": ""
  },
  {
    "quantity": "proton g factor",
    "value": "5.585 694 6893",
    "uncertainty": "0.000 000 0016",
    "unit": ""
  },
  {
    "quantity": "proton gyromag. ratio",
    "value": "2.675 221 8708 e8",
    "uncertainty": "0.000 000 0011 e8",
    "unit": "s^-1 T^-1"
  },
  {
    "quantity": "proton gyromag. ratio in MHz/T",
    "value": "42.577 478 461",
    "uncertainty": "0.000 000 018",
    "unit": "MHz T^-1"
  },
  {
    "quantity": "proton mag. mom.",
    "value": "1.410 606 795 45 e-26",
    "uncertainty": "0.000 000 000 60 e-26",
    "unit": "J T^-1"
  },
  {
    "quantity": "proton mag. mom. to Bohr magneton ratio",
    "value": "1.521 032 202 30 e-3",
    "uncertainty": "0.000 000 000 45 e-3",
    "unit": ""
  },
  {
    "quantity": "proton mag. mom. to nuclear magneton ratio",
    "value": "2.792 847 344 63",
    "uncertainty": "0.000 000 000 82",
    "unit": ""
  },
  {
    "quantity": "proton mag. shielding correction",
    "value": "2.567 15 e-5",
    "uncertainty": "0.000 41 e-5",
    "unit": ""
  },
  {
    "quantity": "proton mass",
    "value": "1.672 621 925 95 e-27",
    "uncertainty": "0.000 000 000 52 e-27",
    "unit": "kg"
  },
  {
    "quantity": "proton mass energy equivalent",
    "value": "1.503 277 618 02 e-10",
    "uncertainty": "0.000 000 000 47 e-10",
    "unit": "J"
  },
  {
    "quantity": "proton mass energy equivalent in MeV",
    "value": "938.272 089 43",
    "uncertainty": "0.000 000 29",
    "unit": "MeV"
  },
  {
    "quantity": "proton mass in u",
    "value": "1.007 276 466 5789",
    "uncertainty": "0.000 000 000 0083",
    "unit": "u"
  },
  {
    "quantity": "proton molar mass",
    "value": "1.007 276 467 64 e-3",
    "uncertainty": "0.000 000 000 31 e-3",
    "unit": "kg mol^-1"
  },
  {
    "quantity": "proton-muon mass ratio",
    "value": "8.880 243 38",
    "uncertainty": "0.000 000 20",
    "unit": ""
  },
  {
    "quantity": "proton-neutron mag. mom. ratio",
    "value": "-1.459 898 02",
    "uncertainty": "0.000 000 34",
    "unit": ""
  },
  {
    "quantity": "proton-neutron mass ratio",
    "value": "0.998 623 477 97",
    "uncertainty": "0.000 000 000 40",
    "unit": ""
  },
  {
    "quantity": "proton relative atomic mass",
    "value": "1.007 276 466 5789",
    "uncertainty": "0.000 000 000 0083",
    "unit": ""
  },
  {
    "quantity": "proton rms charge radius",
    "value": "8.4075 e-16",
    "uncertainty": "0.0064 e-16",
    "unit": "m"
  },
  {
    "quantity": "proton-tau mass ratio",
    "value": "0.528 051",
    "uncertainty": "0.000 036",
    "unit": ""
  },
  {
    "quantity": "quantum of circulation",
    "value": "3.636 947 5467 e-4",
    "uncertainty": "0.000 000 0011 e-4",
    "unit": "m^2 s^-1"
  },
  {
    "quantity": "quantum of circulation times 2",
    "value": "7.273 895 0934 e-4",
    "uncertainty": "0.000 000 0023 e-4",
    "unit": "m^2 s^-1"
  },
  {
    "quantity": "reduced Compton wavelength",
    "value": "3.861 592 6744 e-13",
    "uncertainty": "0.000 000 0012 e-13",
    "unit": "m"
  },
  {
    "quantity": "reduced muon Compton wavelength",
    "value": "1.867 594 306 e-15",
    "uncertainty": "0.000 000 042 e-15",
    "unit": "m"
  },
  {
    "quantity": "reduced neutron Compton wavelength",
    "value": "2.100 194 1520 e-16",
    "uncertainty": "0.000 000 0011 e-16",
    "unit": "m"
  },
  {
    "quantity": "reduced Planck constant",
    "value": "1.054 571 817... e-34",
    "uncertainty": "(exact)",
    "unit": "J s"
  },
  {
    "quantity": "reduced Planck constant in eV s",
    "value": "6.582 119 569... e-16",
    "uncertainty": "(exact)",
    "unit": "eV s"
  },
  {
    "quantity": "reduced Planck constant times c in MeV fm",
    "value": "197.326 980 4...",
    "uncertainty": "(exact)",
    "unit": "MeV fm"
  },
  {
    "quantity": "reduced proton Compton wavelength",
    "value": "2.103 089 100 51 e-16",
    "uncertainty": "0.000 000 000 66 e-16",
    "unit": "m"
  },
  {
    "quantity": "reduced tau Compton wavelength",
    "value": "1.110 538 e-16",
    "uncertainty": "0.000 075 e-16",
    "unit": "m"
  },
  {
    "quantity": "Rydberg constant",
    "value": "10 973 731.568 157",
    "uncertainty": "0.000 012",
    "unit": "m^-1"
  },
  {
    "quantity": "Rydberg constant times c in Hz",
    "value": "3.289 841 960 2500 e15",
    "uncertainty": "0.000 000 000 0036 e15",
    "unit": "Hz"
  },
  {
    "quantity": "Rydberg constant times hc in eV",
    "value": "13.605 693 122 990",
    "uncertainty": "0.000 000 000 015",
    "unit": "eV"
  },
  {
    "quantity": "Rydberg constant times hc in J",
    "value": "2.179 872 361 1030 e-18",
    "uncertainty": "0.000 000 000 0024 e-18",
    "unit": "J"
  },
  {
    "quantity": "Sackur-Tetrode constant (1 K, 100 kPa)",
    "value": "-1.151 707 534 96",
    "uncertainty": "0.000 000 000 47",
    "unit": ""
  },
  {
    "quantity": "Sackur-Tetrode constant (1 K, 101.325 kPa)",
    "value": "-1.164 870 521 49",
    "uncertainty": "0.000 000 000 47",
    "unit": ""
  },
  {
    "quantity": "second radiation constant",
    "value": "1.438 776 877... e-2",
    "uncertainty": "(exact)",
    "unit": "m K"
  },
  {
    "quantity": "shielded helion gyromag. ratio",
    "value": "2.037 894 6078 e8",
    "uncertainty": "0.000 000 0018 e8",
    "unit": "s^-1 T^-1"
  },
  {
    "quantity": "shielded helion gyromag. ratio in MHz/T",
    "value": "32.434 100 033",
    "uncertainty": "0.000 000 028",
    "unit": "MHz T^-1"
  },
  {
    "quantity": "shielded helion mag. mom.",
    "value": "-1.074 553 110 35 e-26",
    "uncertainty": "0.000 000 000 93 e-26",
    "unit": "J T^-1"
  },
  {
    "quantity": "shielded helion mag. mom. to Bohr magneton ratio",
    "value": "-1.158 671 494 57 e-3",
    "uncertainty": "0.000 000 000 94 e-3",
    "unit": ""
  },
  {
    "quantity": "shielded helion mag. mom. to nuclear magneton ratio",
    "value": "-2.127 497 7624",
    "uncertainty": "0.000 000 0017",
    "unit": ""
  },
  {
    "quantity": "shielded helion to proton mag. mom. ratio",
    "value": "-0.761 766 577 21",
    "uncertainty": "0.000 000 000 66",
    "unit": ""
  },
  {
    "quantity": "shielded helion to shielded proton mag. mom. ratio",
    "value": "-0.761 786 1334",
    "uncertainty": "0.000 000 0031",
    "unit": ""
  },
  {
    "quantity": "shielded proton gyromag. ratio",
    "value": "2.675 153 194 e8",
    "uncertainty": "0.000 000 011 e8",
    "unit": "s^-1 T^-1"
  },
  {
    "quantity": "shielded proton gyromag. ratio in MHz/T",
    "value": "42.576 385 43",
    "uncertainty": "0.000 000 17",
    "unit": "MHz T^-1"
  },
  {
    "quantity": "shielded proton mag. mom.",
    "value": "1.410 570 5830 e-26",
    "uncertainty": "0.000 000 0058 e-26",
    "unit": "J T^-1"
  },
  {
    "quantity": "shielded proton mag. mom. to Bohr magneton ratio",
    "value": "1.520 993 1551 e-3",
    "uncertainty": "0.000 000 0062 e-3",
    "unit": ""
  },
  {
    "quantity": "shielded proton mag. mom. to nuclear magneton ratio",
    "value": "2.792 775 648",
    "uncertainty": "0.000 000 011",
    "unit": ""
  },
  {
    "quantity": "shielding difference of d and p in HD",
    "value": "1.987 70 e-8",
    "uncertainty": "0.000 10 e-8",
    "unit": ""
  },
  {
    "quantity": "shielding difference of t and p in HT",
    "value": "2.394 50 e-8",
    "uncertainty": "0.000 20 e-8",
    "unit": ""
  },
  {
    "quantity": "speed of light in vacuum",
    "value": "299 792 458",
    "uncertainty": "(exact)",
    "unit": "m s^-1"
  },
  {
    "quantity": "standard acceleration of gravity",
    "value": "9.806 65",
    "uncertainty": "(exact)",
    "unit": "m s^-2"
  },
  {
    "quantity": "standard atmosphere",
    "value": "101 325",
    "uncertainty": "(exact)",
    "unit": "Pa"
  },
  {
    "quantity": "standard-state pressure",
    "value": "100 000",
    "uncertainty": "(exact)",
    "unit": "Pa"
  },
  {
    "quantity": "Stefan-Boltzmann constant",
    "value": "5.670 374 419... e-8",
    "uncertainty": "(exact)",
    "unit": "W m^-2 K^-4"
  },
  {
    "quantity": "tau Compton wavelength",
    "value": "6.977 71 e-16",
    "uncertainty": "0.000 47 e-16",
    "unit": "m"
  },
  {
    "quantity": "tau-electron mass ratio",
    "value": "3477.23",
    "uncertainty": "0.23",
    "unit": ""
  },
  {
    "quantity": "tau energy equivalent",
    "value": "1776.86",
    "uncertainty": "0.12",
    "unit": "MeV"
  },
  {
    "quantity": "tau mass",
    "value": "3.167 54 e-27",
    "uncertainty": "0.000 21 e-27",
    "unit": "kg"
  },
  {
    "quantity": "tau mass energy equivalent",
    "value": "2.846 84 e-10",
    "uncertainty": "0.000 19 e-10",
    "unit": "J"
  },
  {
    "quantity": "tau mass in u",
    "value": "1.907 54",
    "uncertainty": "0.000 13",
    "unit": "u"
  },
  {
    "quantity": "tau molar mass",
    "value": "1.907 54 e-3",
    "uncertainty": "0.000 13 e-3",
    "unit": "kg mol^-1"
  },
  {
    "quantity": "tau-muon mass ratio",
    "value": "16.8170",
    "uncertainty": "0.0011",
    "unit": ""
  },
  {
    "quantity": "tau-neutron mass ratio",
    "value": "1.891 15",
    "uncertainty": "0.000 13",
    "unit": ""
  },
  {
    "quantity": "tau-proton mass ratio",
    "value": "1.893 76",
    "uncertainty": "0.000 13",
    "unit": ""
  },
  {
    "quantity": "Thomson cross section",
    "value": "6.652 458 7051 e-29",
    "uncertainty": "0.000 000 0062 e-29",
    "unit": "m^2"
  },
  {
    "quantity": "triton-electron mass ratio",
    "value": "5496.921 535 51",
    "uncertainty": "0.000 000 21",
    "unit": ""
  },
  {
    "quantity": "triton g factor",
    "value": "5.957 924 930",
    "uncertainty": "0.000 000 012",
    "unit": ""
  },
  {
    "quantity": "triton mag. mom.",
    "value": "1.504 609 5178 e-26",
    "uncertainty": "0.000 000 0030 e-26",
    "unit": "J T^-1"
  },
  {
    "quantity": "triton mag. mom. to Bohr magneton ratio",
    "value": "1.622 393 6648 e-3",
    "uncertainty": "0.000 000 0032 e-3",
    "unit": ""
  },
  {
    "quantity": "triton mag. mom. to nuclear magneton ratio",
    "value": "2.978 962 4650",
    "uncertainty": "0.000 000 0059",
    "unit": ""
  },
  {
    "quantity": "triton mass",
    "value": "5.007 356 7512 e-27",
    "uncertainty": "0.000 000 0016 e-27",
    "unit": "kg"
  },
  {
    "quantity": "triton mass energy equivalent",
    "value": "4.500 387 8119 e-10",
    "uncertainty": "0.000 000 0014 e-10",
    "unit": "J"
  },
  {
    "quantity": "triton mass energy equivalent in MeV",
    "value": "2808.921 136 68",
    "uncertainty": "0.000 000 88",
    "unit": "MeV"
  },
  {
    "quantity": "triton mass in u",
    "value": "3.015 500 715 97",
    "uncertainty": "0.000 000 000 10",
    "unit": "u"
  },
  {
    "quantity": "triton molar mass",
    "value": "3.015 500 719 13 e-3",
    "uncertainty": "0.000 000 000 94 e-3",
    "unit": "kg mol^-1"
  },
  {
    "quantity": "triton-proton mass ratio",
    "value": "2.993 717 034 03",
    "uncertainty": "0.000 000 000 10",
    "unit": ""
  },
  {
    "quantity": "triton relative atomic mass",
    "value": "3.015 500 715 97",
    "uncertainty": "0.000 000 000 10",
    "unit": ""
  },
  {
    "quantity": "triton to proton mag. mom. ratio",
    "value": "1.066 639 9189",
    "uncertainty": "0.000 000 0021",
    "unit": ""
  },
  {
    "quantity": "unified atomic mass unit",
    "value": "1.660 539 068 92 e-27",
    "uncertainty": "0.000 000 000 52 e-27",
    "unit": "kg"
  },
  {
    "quantity": "vacuum electric permittivity",
    "value": "8.854 187 8188 e-12",
    "uncertainty": "0.000 000 0014 e-12",
    "unit": "F m^-1"
  },
  {
    "quantity": "vacuum mag. permeability",
    "value": "1.256 637 061 27 e-6",
    "uncertainty": "0.000 000 000 20 e-6",
    "unit": "N A^-2"
  },
  {
    "quantity": "von Klitzing constant",
    "value": "25 812.807 45...",
    "uncertainty": "(exact)",
    "unit": "ohm"
  },
  {
    "quantity": "weak mixing angle",
    "value": "0.223 05",
    "uncertainty": "0.000 23",
    "unit": ""
  },
  {
    "quantity": "Wien frequency displacement law constant",
    "value": "5.878 925 757... e10",
    "uncertainty": "(exact)",
    "unit": "Hz K^-1"
  },
  {
    "quantity": "Wien wavelength displacement law constant",
    "value": "2.897 771 955... e-3",
    "uncertainty": "(exact)",
    "unit": "m K"
  },
  {
    "quantity": "W to Z mass ratio",
    "value": "0.881 45",
    "uncertainty": "0.000 13",
    "unit": ""
  }
];
