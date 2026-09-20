import type { FrontierRecord } from "./frontier-records-2026";

// New category: "Speed Records" — real, source-verified "fastest machine" records that don't
// belong under an existing science category (car/train/coaster/human-powered vehicle), each
// checked against the single authoritative certifying body for that record (FIA, Guinness World
// Records, the ride manufacturer/operator, or the IHPVA) as of 2026-09-20. A "fastest production
// car" entry was considered and dropped: Bugatti's 304.773 mph run (2019) was single-direction
// only, while stricter two-way-average rules recognize a different, separately disputed record
// holder — there is no single clean, uncontested number to cite, the same reason a couple of
// topics were dropped from the original FRONTIER_RECORDS_2026 batch.
export const SPEED_RECORDS: FrontierRecord[] = [
  {
    registryNumber: "LR-LAND-SPEED-RECORD", slug: "land-speed-record", title: "Outright land speed record",
    category: "Speed Records", subcategory: "Land vehicles", direction: "MAXIMIZE",
    metricName: "Speed of a wheeled land vehicle, two-way average over a measured mile", unit: "mph",
    formalStatement: "The highest speed achieved by a wheeled land vehicle, as a two-way average over a measured distance, certified by the FIA as the outright World Land Speed Record.",
    summary: "ThrustSSC, a British jet-powered car driven by Andy Green, reached 763.035 mph (1,227.985 km/h) over a measured mile on October 15, 1997 at Black Rock Desert, Nevada — the first supersonic land speed record (Mach 1.016). It remains unbroken as of 2026; the successor Bloodhound LSR project never completed a record attempt.",
    value: "763.035",
    claimType: "CONSTRUCTION", epistemicStatus: "SOURCE_CONFIRMED", limitStatus: "OPEN",
    methodSummary: "Certified by the FIA (Fédération Internationale de l'Automobile) via two-way average speed over a measured mile, per official land speed record rules.",
    source: { title: "FIA World Land Speed Records", url: "https://www.fia.com/fia-world-land-speed-records", date: "1997-10-15", location: "Black Rock Desert, Nevada, USA" },
  },
  {
    registryNumber: "LR-MAGLEV-TRAIN-SPEED", slug: "maglev-train-speed", title: "Fastest train (any type)",
    category: "Speed Records", subcategory: "Rail", direction: "MAXIMIZE",
    metricName: "Highest speed achieved by a manned rail vehicle", unit: "km/h",
    formalStatement: "The highest speed achieved by a manned rail vehicle of any kind — wheeled or magnetically levitated — as certified by Guinness World Records.",
    summary: "Central Japan Railway's L0 Series superconducting maglev train reached 603 km/h (374.7 mph) on the Yamanashi Maglev Test Line on April 21, 2015 — the fastest any train has ever traveled. The line remains a test track as of 2026; commercial Chūō Shinkansen service using this technology is planned at a lower 500 km/h operating speed once launched.",
    value: "603",
    claimType: "CONSTRUCTION", epistemicStatus: "SOURCE_CONFIRMED", limitStatus: "OPEN",
    methodSummary: "Measured on JR Central's dedicated Yamanashi test track and certified as a Guinness World Record.",
    source: { title: "Fastest maglev train — Guinness World Records", url: "https://www.guinnessworldrecords.com/world-records/fastest-maglev-train", date: "2015-04-21", location: "Yamanashi Maglev Test Line, Yamanashi, Japan" },
  },
  {
    registryNumber: "LR-FASTEST-ROLLER-COASTER", slug: "fastest-roller-coaster", title: "Fastest roller coaster",
    category: "Speed Records", subcategory: "Amusement rides", direction: "MAXIMIZE",
    metricName: "Top speed reached by a roller coaster", unit: "km/h",
    formalStatement: "The highest top speed reached by any operating roller coaster.",
    summary: "Falcon's Flight, an Intamin LSM-launched steel coaster at Six Flags Qiddiya City (Saudi Arabia), reached a top speed of 250 km/h (155.3 mph) on opening December 31, 2025 — also the tallest (195 m) and longest (4,325 m) roller coaster in the world. It surpassed Formula Rossa's 240 km/h record, which had stood since 2010.",
    value: "250",
    claimType: "CONSTRUCTION", epistemicStatus: "SOURCE_CONFIRMED", limitStatus: "OPEN",
    methodSummary: "Manufacturer-published ride specifications, corroborated by independent theme-park press coverage at opening.",
    source: { title: "Intamin — Falcon's Flight, Six Flags Qiddiya City", url: "https://www.intamin.com/2026/01/15/six-flags-qiddiya-city-falcons-flight/", date: "2025-12-31", location: "Six Flags Qiddiya City, Al-Qiddiya, Saudi Arabia" },
  },
  {
    registryNumber: "LR-HUMAN-POWERED-VEHICLE-SPEED", slug: "human-powered-vehicle-speed", title: "Fastest human-powered vehicle",
    category: "Speed Records", subcategory: "Human-powered vehicles", direction: "MAXIMIZE",
    metricName: "Speed of a human-powered vehicle, flying-start 200 m", unit: "km/h",
    formalStatement: "The highest speed achieved by a vehicle powered solely by human effort — no motor, no motor-paced draft — over a flying-start 200-meter course, sanctioned by the IHPVA.",
    summary: "Todd Reichert reached 144.17 km/h (89.59 mph) pedaling AeroVelo's fully-faired recumbent bicycle Eta at the World Human Powered Speed Challenge in Battle Mountain, Nevada, on September 17, 2016 — still the record as of 2026, a rare case where a human on a bicycle outruns most cars on a highway.",
    value: "144.17",
    claimType: "CONSTRUCTION", epistemicStatus: "SOURCE_CONFIRMED", limitStatus: "OPEN",
    methodSummary: "Timed over a flying-start 200 m course and sanctioned by the International Human Powered Vehicle Association (IHPVA).",
    source: { title: "World Human Powered Speed Challenge — competition records", url: "http://www.whpva.org/competition.html", date: "2016-09-17", location: "Battle Mountain, Nevada, USA" },
  },
];
