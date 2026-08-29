export type HumanAnimalRecord = {
  registryNumber: string;
  slug: string;
  title: string;
  subcategory: string;
  direction: "MAXIMIZE" | "MINIMIZE";
  metricName: string;
  unit: string;
  formalStatement: string;
  summary: string;
  value: string;
  methodSummary: string;
  source: { title: string; url: string; date: string; location: string };
};

// Real, source-verified human athletics and animal-performance records — every value checked
// against an authoritative record-keeping body (World Athletics, Guinness World Records) or the
// original measurement study, current as of 2026-08-29. Each publishes as an OPEN Limit with a
// single ACCEPTED "best demonstrated value" claim (category Biology, matching the existing
// human/animal-performance stub records already in the Registry) — a demonstrated record is not
// a proven theoretical ceiling, so none of these close to PROVEN.
export const HUMAN_ANIMAL_RECORDS: HumanAnimalRecord[] = [
  {
    registryNumber: "LR-100M-MEN",
    slug: "100m-sprint-men",
    title: "Men's 100 meters sprint",
    subcategory: "Athletics",
    direction: "MINIMIZE",
    metricName: "100 meters sprint time (men, record-eligible)",
    unit: "s",
    formalStatement: "The fastest time recorded for a man to run 100 meters from starting blocks, under World Athletics record-eligible conditions (legal tailwind of 2.0 m/s or less, unaided, drug-tested).",
    summary: "Usain Bolt ran 9.58 seconds at the 2009 World Championships in Berlin on August 16, 2009, breaking his own previous world record of 9.69 seconds set a year earlier. It remains the official World Athletics record as of 2026.",
    value: "9.58",
    methodSummary: "Electronically timed 100 m sprint final at the 2009 World Championships in Athletics, ratified by the IAAF (now World Athletics) as the official world record.",
    source: { title: "100 metres world record — World Athletics", url: "https://worldathletics.org/records/by-category/world-records", date: "2009-08-16", location: "Olympiastadion, Berlin, Germany" },
  },
  {
    registryNumber: "LR-100M-WOMEN",
    slug: "100m-sprint-women",
    title: "Women's 100 meters sprint",
    subcategory: "Athletics",
    direction: "MINIMIZE",
    metricName: "100 meters sprint time (women, record-eligible)",
    unit: "s",
    formalStatement: "The fastest time recorded for a woman to run 100 meters from starting blocks, under World Athletics record-eligible conditions (legal tailwind of 2.0 m/s or less, unaided, drug-tested).",
    summary: "Florence Griffith-Joyner ran 10.49 seconds at the 1988 U.S. Olympic Trials in Indianapolis on July 16, 1988, with an official wind reading of 0.0 m/s. World Athletics still recognizes it as the official record as of 2026, though Track & Field News and some biomechanists have long argued the wind gauge reading understated an assisting wind. The record has never been annulled.",
    value: "10.49",
    methodSummary: "Electronically timed 100 m sprint quarterfinal at the 1988 U.S. Olympic Trials, ratified by the IAAF as the official world record.",
    source: { title: "100 metres world record — World Athletics", url: "https://worldathletics.org/records/by-category/world-records", date: "1988-07-16", location: "IU Michael A. Carroll Track & Soccer Stadium, Indianapolis, USA" },
  },
  {
    registryNumber: "LR-MARATHON-MEN",
    slug: "marathon-men",
    title: "Men's marathon",
    subcategory: "Athletics",
    direction: "MINIMIZE",
    metricName: "Marathon (42.195 km) time (men, record-eligible road race)",
    unit: "h:mm:ss",
    formalStatement: "The fastest time recorded for a man to run the standard marathon distance of 42.195 km in a World Athletics record-eligible road race — a certified course meeting the elevation-drop and start-finish-separation rules, run in open competition without rotating pacers.",
    summary: "Kenya's Sabastian Sawe ran 1:59:30 at the 2026 London Marathon on April 26, 2026 — the first sub-two-hour marathon ever run in official, record-eligible race conditions. (Eliud Kipchoge's 1:59:40 in the 2019 INEOS 1:59 Challenge used rotating pacers and a start/finish loop that made it ineligible as an official record.)",
    value: "1:59:30",
    methodSummary: "Course-record, record-eligible marathon performance ratified by World Athletics.",
    source: { title: "Marathon world record progression", url: "https://en.wikipedia.org/wiki/Marathon_world_record_progression", date: "2026-04-26", location: "London Marathon, London, UK" },
  },
  {
    registryNumber: "LR-MARATHON-WOMEN-MIXED",
    slug: "marathon-women-mixed",
    title: "Women's marathon (mixed-sex race)",
    subcategory: "Athletics",
    direction: "MINIMIZE",
    metricName: "Marathon (42.195 km) time (women, mixed-sex race, record-eligible)",
    unit: "h:mm:ss",
    formalStatement: "The fastest time recorded for a woman to run the standard marathon distance of 42.195 km in a World Athletics record-eligible road race run alongside men (a mixed-sex field, which can provide pacing benefit).",
    summary: "Kenya's Ruth Chepngetich ran 2:09:56 at the 2024 Chicago Marathon on October 13, 2024, the first woman to break 2:10 in a mixed-sex race. World Athletics confirmed the time as the official mixed-sex world record.",
    value: "2:09:56",
    methodSummary: "Course-record marathon performance in a mixed-sex field, ratified by World Athletics.",
    source: { title: "Marathon world record progression", url: "https://en.wikipedia.org/wiki/Marathon_world_record_progression", date: "2024-10-13", location: "Chicago Marathon, Chicago, USA" },
  },
  {
    registryNumber: "LR-MARATHON-WOMEN-ONLY",
    slug: "marathon-women-only",
    title: "Women's marathon (women-only race)",
    subcategory: "Athletics",
    direction: "MINIMIZE",
    metricName: "Marathon (42.195 km) time (women, women-only race, record-eligible)",
    unit: "h:mm:ss",
    formalStatement: "The fastest time recorded for a woman to run the standard marathon distance of 42.195 km in a World Athletics record-eligible road race with no male competitors or pacers.",
    summary: "Ethiopia's Tigst Assefa ran 2:15:41 at the 2026 London Marathon on April 26, 2026 — the fastest marathon ever run by a woman with no male pacers. World Athletics tracks this as a separate category from the mixed-sex record because male pacers measurably improve women's race times.",
    value: "2:15:41",
    methodSummary: "Course-record marathon performance in a women-only field, ratified by World Athletics.",
    source: { title: "Marathon world record progression", url: "https://en.wikipedia.org/wiki/Marathon_world_record_progression", date: "2026-04-26", location: "London Marathon, London, UK" },
  },
  {
    registryNumber: "LR-HIGH-JUMP-MEN",
    slug: "high-jump-men",
    title: "Men's high jump",
    subcategory: "Athletics",
    direction: "MAXIMIZE",
    metricName: "High jump height (men, record-eligible)",
    unit: "m",
    formalStatement: "The greatest height cleared by a man in the high jump, under World Athletics record-eligible conditions.",
    summary: "Cuba's Javier Sotomayor cleared 2.45 meters on July 27, 1993 in Salamanca, Spain. It is the longest-standing record in men's track and field still on the books, unbroken as of 2026.",
    value: "2.45",
    methodSummary: "Ratified competition clearance, confirmed by World Athletics.",
    source: { title: "High jump world record — World Athletics", url: "https://worldathletics.org/records/by-category/world-records", date: "1993-07-27", location: "Salamanca, Spain" },
  },
  {
    registryNumber: "LR-LONG-JUMP-MEN",
    slug: "long-jump-men",
    title: "Men's long jump",
    subcategory: "Athletics",
    direction: "MAXIMIZE",
    metricName: "Long jump distance (men, record-eligible)",
    unit: "m",
    formalStatement: "The greatest distance jumped by a man in the long jump, under World Athletics record-eligible conditions (legal tailwind of 2.0 m/s or less).",
    summary: "The United States' Mike Powell jumped 8.95 meters on August 30, 1991 at the World Championships in Tokyo, breaking Bob Beamon's 23-year-old record of 8.90 m. It remains unbroken as of 2026.",
    value: "8.95",
    methodSummary: "Ratified competition jump, confirmed by World Athletics.",
    source: { title: "Long jump world record — World Athletics", url: "https://worldathletics.org/records/by-category/world-records", date: "1991-08-30", location: "Tokyo, Japan" },
  },
  {
    registryNumber: "LR-PEREGRINE-FALCON-DIVE",
    slug: "peregrine-falcon-dive-speed",
    title: "Peregrine falcon dive speed",
    subcategory: "Animal Locomotion",
    direction: "MAXIMIZE",
    metricName: "Peak recorded dive (stoop) speed (Falco peregrinus)",
    unit: "km/h",
    formalStatement: "The fastest speed recorded for a peregrine falcon (Falco peregrinus) during a hunting stoop (dive), measured with onboard or tracking instrumentation.",
    summary: "Falconer Ken Franklin's trained peregrine falcon, Frightful, was recorded diving at 242 mph (389.5 km/h) in 1999 after being released from a Cessna 172 at 17,000 feet and tracked with an altimeter and GPS. Guinness World Records recognizes it as the fastest confirmed speed of any animal on Earth.",
    value: "389.5",
    methodSummary: "GPS- and altimeter-tracked stoop dive, recognized by Guinness World Records as the fastest bird dive on record.",
    source: { title: "Fastest bird (diving) — Guinness World Records", url: "https://www.guinnessworldrecords.com/world-records/70929-fastest-bird-diving", date: "1999-01-01", location: "Friday Harbor, Washington, USA" },
  },
  {
    registryNumber: "LR-BLUE-WHALE-MASS",
    slug: "blue-whale-mass",
    title: "Blue whale — heaviest recorded animal",
    subcategory: "Cetology",
    direction: "MAXIMIZE",
    metricName: "Heaviest recorded individual animal, by mass (Balaenoptera musculus)",
    unit: "t",
    formalStatement: "The greatest confirmed body mass recorded for a single blue whale (Balaenoptera musculus) — the heaviest animal known to have existed. Scoped to mass specifically: the blue whale is not the longest animal on record — the bootlace worm (Lineus longissimus) can reach roughly 55 m — this record concerns mass alone.",
    summary: "A female blue whale caught in the Southern Ocean on March 20, 1947 was recorded at 190 tonnes (418,878 lb) and 27.6 meters long — the heaviest individual animal ever confirmed. Blue whales remain the most massive animals known to have lived, though several other species exceed them in body length alone.",
    value: "190",
    methodSummary: "Measured and weighed at a whaling station per standard mid-20th-century whaling industry practice; the best-documented maximum mass for the species. Modern non-lethal measurement methods (photogrammetry, drone survey) have not exceeded this figure.",
    source: { title: "Largest animal — Guinness World Records", url: "https://www.guinnessworldrecords.com/world-records/115537-largest-animal", date: "1947-03-20", location: "Southern Ocean (whaling record)" },
  },
];

// Fills in the existing LR-DRAFT-BIO-18 stub (title already reserved as "Cheetah sprint speed")
// with real, sourced content rather than creating a new registry number.
export const CHEETAH_SPEED_UPDATE = {
  registryNumber: "LR-DRAFT-BIO-18",
  subcategory: "Animal Locomotion",
  direction: "MAXIMIZE" as const,
  metricName: "Peak recorded running speed (Acinonyx jubatus, timed run)",
  unit: "km/h",
  formalStatement: "The fastest instantaneous running speed recorded for a cheetah (Acinonyx jubatus) on a measured, timed course.",
  summary: "Sarah, a cheetah at the Cincinnati Zoo, ran a certified 100-meter course in 5.95 seconds on June 20, 2012, with an instantaneous top speed clocked at 61 mph (98.2 km/h) — faster than her own previous record of 6.13 seconds set in 2009. It remains the most-cited record for the fastest confirmed speed of any land animal.",
  value: "98.2",
  methodSummary: "Timed on a course certified by the Road Running Technical Council of USA Track & Field; instantaneous top speed measured during the run, not the 100 m average pace.",
  source: { title: "Cincinnati Zoo cheetah speed record", url: "https://cincinnatizoo.org/cincinnati-zoo-cheetah-sets-new-world-speed-record/", date: "2012-06-20", location: "Cincinnati Zoo & Botanical Garden, Ohio, USA" },
};
