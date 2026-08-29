export type FrontierRecord = {
  registryNumber: string;
  slug: string;
  title: string;
  category: string;
  subcategory: string;
  direction: "MAXIMIZE" | "MINIMIZE";
  metricName: string;
  unit: string;
  formalStatement: string;
  summary: string;
  value: string;
  claimType: "CONSTRUCTION" | "COUNTEREXAMPLE";
  epistemicStatus: "SOURCE_CONFIRMED" | "FORMALLY_PROVEN" | "LITERATURE_ASSERTED";
  limitStatus: "OPEN" | "PROVEN";
  methodSummary: string;
  source: { title: string; url: string; date: string; location: string };
};

// Real, source-verified records across Energy, Engineering, Computing, and Economics — each
// checked against an authoritative body (a national lab, a standards body, Guinness World
// Records, a primary exchange/regulator source, or a peer-reviewed paper) as of 2026-08-29.
// Two requested topics (industrial robot "precision records" and generic "packet-loss bounds")
// were dropped: neither has a single clean, independently-verified record — the first is a
// manufacturer spec no record body tracks, the second varies by IEEE 802.3 clause/rate with no
// single number to cite. Publishing generic best case for the caveat is baked into each entry
// where a figure is likely to move fast, is disputed, or is a vendor design target rather than
// an audited measurement — rather than presenting any of those as settled fact.
export const FRONTIER_RECORDS_2026: FrontierRecord[] = [
  // --- Energy ---
  {
    registryNumber: "LR-SOLAR-CELL-EFFICIENCY", slug: "solar-cell-efficiency", title: "Solar cell efficiency (any technology)",
    category: "Energy", subcategory: "Photovoltaics", direction: "MAXIMIZE",
    metricName: "Photovoltaic cell conversion efficiency, any technology", unit: "%",
    formalStatement: "The highest confirmed sunlight-to-electricity conversion efficiency achieved by any photovoltaic cell, under standard reporting conditions, tracked on NREL's Best Research-Cell Efficiency Chart.",
    summary: "Fraunhofer ISE (Germany) reported a four-junction III-V concentrator cell at 47.6% efficiency under 665x sunlight concentration in May 2022, listed on NREL's Best Research-Cell Efficiency Chart. It remains the highest confirmed photovoltaic efficiency of any kind as of 2026 — note this is a lab concentrator cell, not representative of any deployable rooftop panel (best one-sun silicon cells run closer to 28%).",
    value: "47.6",
    claimType: "CONSTRUCTION", epistemicStatus: "SOURCE_CONFIRMED", limitStatus: "OPEN",
    methodSummary: "Measured under 665-sun concentration; listed on NREL's independently-aggregated Best Research-Cell Efficiency Chart.",
    source: { title: "Fraunhofer ISE — World's most efficient solar cell, 47.6%", url: "https://www.ise.fraunhofer.de/en/press-media/press-releases/2022/fraunhofer-ise-develops-the-worlds-most-efficient-solar-cell-with-47-comma-6-percent-efficiency.html", date: "2022-05-01", location: "Fraunhofer Institute for Solar Energy Systems ISE, Freiburg, Germany" },
  },
  {
    registryNumber: "LR-BATTERY-ENERGY-DENSITY", slug: "battery-energy-density", title: "Battery specific energy density (commercial cell)",
    category: "Energy", subcategory: "Batteries", direction: "MAXIMIZE",
    metricName: "Specific energy of a commercially available battery cell", unit: "Wh/kg",
    formalStatement: "The highest specific energy (Wh/kg) independently verified for a battery cell that a company sells commercially, as opposed to a lab-only research prototype.",
    summary: "Amprius Technologies' silicon-anode lithium-ion cell was independently verified at 500 Wh/kg by Mobile Power Solutions in 2023, making it the first commercially available cell verified at that level. It targets niche high-value markets (drones, aerospace, defense) rather than mainstream EVs, which typically run 250-300 Wh/kg.",
    value: "500",
    claimType: "CONSTRUCTION", epistemicStatus: "SOURCE_CONFIRMED", limitStatus: "OPEN",
    methodSummary: "Independently verified by Mobile Power Solutions; Amprius's standard shipping SiMaxx product is separately rated 450 Wh/kg.",
    source: { title: "Amprius Technologies — investor relations", url: "https://ir.amprius.com/", date: "2023-01-01", location: "Amprius Technologies, Fremont, California, USA" },
  },
  {
    registryNumber: "LR-WIND-TURBINE-CAPACITY", slug: "wind-turbine-capacity", title: "Largest wind turbine (nameplate capacity)",
    category: "Energy", subcategory: "Wind Power", direction: "MAXIMIZE",
    metricName: "Nameplate capacity of a single, grid-connected wind turbine", unit: "MW",
    formalStatement: "The largest nameplate capacity of a single, operational, grid-connected wind turbine, as officially certified by Guinness World Records.",
    summary: "The Mingyang MySE 16-260 offshore wind turbine, rated at 16 MW, holds the Guinness World Records certification as of 2026. A larger 26 MW Dongfang Electric prototype was grid-connected for testing at a facility in Shandong, China in late 2025, but has not yet been independently certified as a record by Guinness — this record is likely to change once that certification catches up.",
    value: "16",
    claimType: "CONSTRUCTION", epistemicStatus: "SOURCE_CONFIRMED", limitStatus: "OPEN",
    methodSummary: "Officially certified by Guinness World Records.",
    source: { title: "Largest wind turbine — Guinness World Records", url: "https://www.guinnessworldrecords.com/world-records/largest-wind-turbine", date: "2023-07-01", location: "Mingyang Smart Energy, China" },
  },
  {
    registryNumber: "LR-NUCLEAR-REACTOR-OUTPUT", slug: "nuclear-reactor-output", title: "Largest nuclear reactor unit (net electrical output)",
    category: "Energy", subcategory: "Nuclear Power", direction: "MAXIMIZE",
    metricName: "Net electrical output of a single commercially operating nuclear reactor unit", unit: "MW",
    formalStatement: "The largest net electrical output of a single nuclear reactor unit currently in commercial operation, per the IAEA's Power Reactor Information System (PRIS).",
    summary: "Taishan Nuclear Power Plant Unit 1 (Guangdong, China), an EPR-design reactor, entered commercial operation in December 2018 at 1,660 MW net electrical output (1,750 MW gross) — the largest of any operating reactor unit as of 2026. Larger EPR-class units under construction elsewhere (e.g. Hinkley Point C, UK) are not yet operational.",
    value: "1660",
    claimType: "CONSTRUCTION", epistemicStatus: "SOURCE_CONFIRMED", limitStatus: "OPEN",
    methodSummary: "Verified against the IAEA Power Reactor Information System (PRIS), the authoritative international database of reactor specifications.",
    source: { title: "IAEA PRIS — Taishan-1 reactor details", url: "https://pris.iaea.org/PRIS/CountryStatistics/ReactorDetails.aspx?current=918", date: "2018-12-01", location: "Taishan Nuclear Power Plant, Guangdong, China" },
  },
  {
    registryNumber: "LR-HYDROGEN-PRODUCTION-EFFICIENCY", slug: "hydrogen-production-efficiency", title: "Hydrogen electrolysis efficiency",
    category: "Energy", subcategory: "Hydrogen", direction: "MINIMIZE",
    metricName: "Specific electricity consumption of an electrolyzer, LHV basis", unit: "kWh/kg H2",
    formalStatement: "The lowest specific electricity consumption (kWh of DC input electricity per kg of hydrogen produced, LHV-referenced) independently measured for an electrolyzer under sustained full-load operation.",
    summary: "Bloom Energy's solid oxide electrolyzer was independently measured by Idaho National Laboratory (a U.S. Department of Energy national lab) at 37.7 kWh/kg H2 (88.5% LHV-referenced efficiency) after roughly 500 hours of full-load operation, reported in 2022. The theoretical thermodynamic minimum is 33.3 kWh/kg on an LHV basis (39.4 kWh/kg on an HHV basis) — vendors routinely cite whichever basis flatters their number, so any comparison across electrolyzer efficiency claims needs to check which reference basis is being used.",
    value: "37.7",
    claimType: "CONSTRUCTION", epistemicStatus: "SOURCE_CONFIRMED", limitStatus: "OPEN",
    methodSummary: "Independently measured by Idaho National Laboratory (INL), a U.S. Department of Energy national lab, over roughly 500 hours of full-load operation.",
    source: { title: "Idaho National Laboratory — Bloom electrolyzer efficiency demonstration", url: "https://www.energytech.com/energy-efficiency/article/21248571/idaho-national-lab-hydrogen-demonstration-bloom-electrolyzer-highly-efficient-at-nearly-38-kwh-per-kg", date: "2022-08-01", location: "Idaho National Laboratory, Idaho Falls, USA" },
  },
  // --- Engineering ---
  {
    registryNumber: "LR-AIRCRAFT-SPEED", slug: "aircraft-speed", title: "Fastest crewed aircraft",
    category: "Engineering", subcategory: "Aviation", direction: "MAXIMIZE",
    metricName: "Airspeed of a crewed, powered, winged aircraft (any launch method)", unit: "km/h",
    formalStatement: "The highest airspeed ever reached by a crewed, powered, winged aircraft, regardless of launch method (distinct from the FAI's runway-to-runway airspeed record, a narrower category held by the SR-71 at 3,529.56 km/h).",
    summary: "USAF test pilot Maj. William \"Pete\" Knight flew the rocket-powered North American X-15A-2 to 7,274 km/h (Mach 6.7) on October 3, 1967, over California. It remains unbroken as of 2026, nearly six decades on.",
    value: "7274",
    claimType: "CONSTRUCTION", epistemicStatus: "SOURCE_CONFIRMED", limitStatus: "OPEN",
    methodSummary: "Officially certified by Guinness World Records.",
    source: { title: "Fastest aircraft (rocket-powered) — Guinness World Records", url: "https://www.guinnessworldrecords.com/world-records/78491-fastest-aircraft-rocket-powered", date: "1967-10-03", location: "Edwards Air Force Base, California, USA" },
  },
  {
    registryNumber: "LR-AIRCRAFT-ALTITUDE", slug: "aircraft-altitude", title: "Highest sustained altitude, crewed aircraft",
    category: "Engineering", subcategory: "Aviation", direction: "MAXIMIZE",
    metricName: "Altitude reached by a crewed aircraft in sustained, level flight", unit: "m",
    formalStatement: "The highest altitude reached by a crewed aircraft in sustained, horizontal (as opposed to a momentary ballistic zoom-climb) flight.",
    summary: "A Lockheed SR-71A Blackbird, crewed by Capt. Robert C. Helt and Maj. Larry A. Elliott, reached 25,929 m (85,069 ft) in sustained horizontal flight on July 28, 1976. A separate, higher figure — 37,650 m by a MiG-25 in a near-vertical zoom climb (Alexandr Fedotov, 1977) — is the official FAI absolute-altitude record, but that was a brief ballistic peak, not sustained flight, which is why this record uses the SR-71 figure instead.",
    value: "25929",
    claimType: "CONSTRUCTION", epistemicStatus: "SOURCE_CONFIRMED", limitStatus: "OPEN",
    methodSummary: "Recognized by Guinness World Records as the highest altitude in horizontal flight.",
    source: { title: "Highest altitude in horizontal flight — Guinness World Records", url: "https://www.guinnessworldrecords.com/world-records/74563-highest-altitude-in-horizontal-flight", date: "1976-07-28", location: "Beale Air Force Base, California, USA" },
  },
  {
    registryNumber: "LR-BRIDGE-SPAN", slug: "bridge-span", title: "Longest suspension bridge main span",
    category: "Engineering", subcategory: "Bridges", direction: "MAXIMIZE",
    metricName: "Main span length of a suspension bridge", unit: "m",
    formalStatement: "The longest main span (the distance between the two support towers) of any suspension bridge currently open.",
    summary: "The 1915 Çanakkale Bridge, crossing the Dardanelles Strait in Turkey, opened March 18, 2022 with a main span of 2,023 meters — surpassing Japan's Akashi Kaikyo Bridge (1,991 m) by 32 meters. No longer span is currently under construction.",
    value: "2023",
    claimType: "CONSTRUCTION", epistemicStatus: "SOURCE_CONFIRMED", limitStatus: "OPEN",
    methodSummary: "Officially certified by Guinness World Records.",
    source: { title: "Longest suspension bridge — Guinness World Records", url: "https://www.guinnessworldrecords.com/world-records/longest-bridge-cable-suspension-bridge", date: "2022-03-18", location: "Dardanelles Strait, Çanakkale, Turkey" },
  },
  {
    registryNumber: "LR-DEEPEST-CREWED-DIVE", slug: "deepest-crewed-dive", title: "Deepest dive by a crewed pressure vessel",
    category: "Engineering", subcategory: "Pressure Vessels", direction: "MAXIMIZE",
    metricName: "Depth reached by a crewed submersible pressure hull", unit: "m",
    formalStatement: "The greatest ocean depth reached by a crewed submersible — chosen as the best-documented real-world extreme-pressure-vessel achievement, since generic industrial pressure-vessel ratings aren't tracked by any record body.",
    summary: "Victor Vescovo piloted the DSV Limiting Factor to 10,934 m (± 3 m) at the bottom of Challenger Deep, Mariana Trench, in 2019 — a hull built to withstand roughly 1,100 times atmospheric pressure. This is the most rigorously documented extreme-pressure engineering achievement of any crewed vessel.",
    value: "10934",
    claimType: "CONSTRUCTION", epistemicStatus: "SOURCE_CONFIRMED", limitStatus: "OPEN",
    methodSummary: "Recognized in the Guinness World Records Hall of Fame; depth reconciled across multiple expeditions to ±3 m.",
    source: { title: "Victor Vescovo — deepest dive by a crewed vessel — Guinness World Records", url: "https://www.guinnessworldrecords.com/records/hall-of-fame/victor-vescovo-deepest-dive-by-a-crewed-vessel", date: "2019-04-28", location: "Challenger Deep, Mariana Trench, Pacific Ocean" },
  },
  {
    registryNumber: "LR-CRANE-LIFT", slug: "crane-lift", title: "Heaviest single lift by a crane",
    category: "Engineering", subcategory: "Heavy Lift", direction: "MAXIMIZE",
    metricName: "Mass lifted in a single crane operation", unit: "t",
    formalStatement: "The heaviest mass ever lifted by a crane in a single operation, as officially certified by Guinness World Records.",
    summary: "The Taisun gantry crane at Yantai Raffles Shipyard, China, lifted a water-ballasted barge weighing 20,133 tonnes on April 18, 2008. The lift used a self-ballasted barge rather than a discrete fabricated structure — a narrower category than lifting manufactured cargo, but Taisun's Guinness-certified figure remains unmatched by any subsequent lift.",
    value: "20133",
    claimType: "CONSTRUCTION", epistemicStatus: "SOURCE_CONFIRMED", limitStatus: "OPEN",
    methodSummary: "Officially certified by Guinness World Records.",
    source: { title: "Heaviest weight lifted by a crane — Guinness World Records", url: "https://www.guinnessworldrecords.com/world-records/heaviest-weight-lifted-by-a-crane", date: "2008-04-18", location: "Yantai Raffles Shipyard, Yantai, China" },
  },
  // --- Computing ---
  {
    registryNumber: "LR-LOW-LATENCY-LINK", slug: "low-latency-network-link", title: "Lowest one-way latency, long-haul network link",
    category: "Computing", subcategory: "Networking", direction: "MINIMIZE",
    metricName: "One-way latency of a real, commercially operated long-haul data link", unit: "ms",
    formalStatement: "The lowest one-way transmission latency publicly documented for a real, commercially operated long-haul network route.",
    summary: "McKay Brothers / Quincy Data published a one-way latency of 3.982 ms over their microwave/millimeter-wave relay network between Aurora, IL (near Chicago) and Carteret, NJ (near the Nasdaq data center) — roughly 1,200 km — in a release dated May 12, 2016. Microwave beats fiber on this route because signals travel through air at close to the vacuum speed of light, versus roughly 68% of that speed in glass fiber. This is the most recent publicly documented figure for this specific corridor as of 2026; providers have continued upgrading their networks since, so a newer figure may exist without having been published.",
    value: "3.982",
    claimType: "CONSTRUCTION", epistemicStatus: "SOURCE_CONFIRMED", limitStatus: "OPEN",
    methodSummary: "Vendor-published (McKay Brothers / Quincy Data), covered by financial trade press; not an independent-lab-audited measurement.",
    source: { title: "Quincy Data / McKay Brothers latency announcement", url: "https://www.prnewswire.com/news-releases/quincy-data-lowers-latency-with-mckay-brothers-upgrades-300268148.html", date: "2016-05-12", location: "Aurora, Illinois to Carteret, New Jersey, USA" },
  },
  {
    registryNumber: "LR-FIBER-THROUGHPUT", slug: "fiber-optic-throughput", title: "Highest single-fiber data transmission capacity",
    category: "Computing", subcategory: "Networking", direction: "MAXIMIZE",
    metricName: "Data transmission capacity demonstrated in a single optical fiber", unit: "Pbit/s",
    formalStatement: "The highest raw data-transmission capacity demonstrated in a single strand of optical fiber under controlled experimental conditions.",
    summary: "Japan's National Institute of Information and Communications Technology (NICT), with Eindhoven University of Technology and the University of L'Aquila, demonstrated 22.9 Pbit/s in a single fiber, announced November 30, 2023 (presented at ECOC 2023). A separate, differently-scoped record exists for capacity over long-haul distance (1.02 Pbit/s over 1,808 km using standard-cladding-diameter fiber, May 2025) — the two figures measure different things and shouldn't be conflated.",
    value: "22.9",
    claimType: "CONSTRUCTION", epistemicStatus: "SOURCE_CONFIRMED", limitStatus: "OPEN",
    methodSummary: "Peer-reviewed post-deadline paper presented at ECOC 2023; confirmed by official NICT press release.",
    source: { title: "NICT — 22.9 Pbit/s single-fiber transmission", url: "https://www.nict.go.jp/en/press/2023/11/30-1.html", date: "2023-11-30", location: "National Institute of Information and Communications Technology, Japan" },
  },
  {
    registryNumber: "LR-CAP-THEOREM", slug: "cap-theorem", title: "CAP theorem — distributed system consistency limit",
    category: "Computing", subcategory: "Distributed Systems", direction: "MAXIMIZE",
    metricName: "Number of {Consistency, Availability, Partition tolerance} properties simultaneously guaranteeable by a distributed system", unit: "of 3",
    formalStatement: "In a distributed data store, at most 2 of the 3 properties Consistency, Availability, and Partition tolerance can be simultaneously guaranteed in the presence of a network partition.",
    summary: "Conjectured by Eric Brewer in a 2000 keynote and formally proved by Seth Gilbert and Nancy Lynch in 2002: no distributed system can guarantee all three of consistency, availability, and partition tolerance at once. Since network partitions can't be ruled out in practice, real systems choose to sacrifice either strict consistency or full availability during a partition — this is a closed, proven result, not an open engineering target.",
    value: "2 of 3 (Consistency, Availability, Partition tolerance)",
    claimType: "COUNTEREXAMPLE", epistemicStatus: "FORMALLY_PROVEN", limitStatus: "PROVEN",
    methodSummary: "Formally proved via an explicit counterexample construction showing no algorithm can satisfy all three properties under a network partition.",
    source: { title: "Brewer's conjecture and the feasibility of consistent, available, partition-tolerant web services", url: "https://dl.acm.org/doi/10.1145/564585.564601", date: "2002-06-01", location: "ACM SIGACT News, Vol. 33, No. 2 (Gilbert & Lynch)" },
  },
  {
    registryNumber: "LR-CLOUD-STORAGE-DURABILITY", slug: "cloud-storage-durability", title: "Cloud object storage durability (vendor-published target)",
    category: "Computing", subcategory: "Storage", direction: "MAXIMIZE",
    metricName: "Vendor-published annual durability design target for commercial cloud object storage", unit: "%",
    formalStatement: "The highest annual durability figure published by a major commercial cloud object-storage provider for a standard storage tier — explicitly a vendor-engineered design target, not an independently audited measured outcome (no major provider publishes an independently audited durability measurement).",
    summary: "AWS publishes a \"designed to provide 99.999999999%\" (11 nines) annual durability target for S3 Standard storage, based on redundancy across at least 3 Availability Zones. This is a modeled engineering target stated in AWS's own documentation, not a third-party-audited empirical result — no major cloud provider (AWS, Azure, Google Cloud, Backblaze) publishes an independently audited durability measurement, so this figure should be read as a vendor design claim, not a verified outcome.",
    value: "99.999999999",
    claimType: "CONSTRUCTION", epistemicStatus: "LITERATURE_ASSERTED", limitStatus: "OPEN",
    methodSummary: "Vendor-published design target based on their redundancy architecture; not independently audited.",
    source: { title: "Amazon S3 — Data Durability and Availability", url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/DataDurability.html", date: "2026-01-01", location: "Amazon Web Services documentation" },
  },
  // --- Economics ---
  {
    registryNumber: "LR-MARKET-CAP-RECORD", slug: "market-cap-record", title: "Highest market capitalization, single public company",
    category: "Economics", subcategory: "Markets", direction: "MAXIMIZE",
    metricName: "Peak market capitalization reached by a single publicly traded company (nominal USD)", unit: "USD",
    formalStatement: "The highest market capitalization (share price times shares outstanding) ever reached by a single publicly traded company, in nominal (not inflation-adjusted) USD.",
    summary: "NVIDIA became the first company to cross $5.5 trillion in market capitalization on May 13, 2026, having first crossed $5 trillion in October 2025. This figure moves every second the market is open and different data providers report different intraday peaks — treat this as an approximate, likely-already-superseded snapshot rather than a fixed record, and check a live tracker (e.g. companiesmarketcap.com) for the current figure.",
    value: "5500000000000",
    claimType: "CONSTRUCTION", epistemicStatus: "SOURCE_CONFIRMED", limitStatus: "OPEN",
    methodSummary: "Real-time exchange price data (Nasdaq), reported by multiple financial news outlets.",
    source: { title: "Forbes — Nvidia hits record $5.5 trillion value", url: "https://www.forbes.com/sites/antoniopequenoiv/2026/05/13/nvidia-hits-record-55-trillion-value-first-company-to-ever-reach-mark/", date: "2026-05-13", location: "Nasdaq" },
  },
  {
    registryNumber: "LR-HYPERINFLATION-RECORD", slug: "hyperinflation-record", title: "Highest recorded hyperinflation rate",
    category: "Economics", subcategory: "Monetary History", direction: "MAXIMIZE",
    metricName: "Peak monthly inflation rate for a national currency", unit: "% per month",
    formalStatement: "The highest peak monthly inflation rate ever recorded for a national currency, per the Hanke-Krus World Hyperinflation Table.",
    summary: "Hungary's pengo peaked at a monthly inflation rate of 4.19x10^16% (41.9 quadrillion percent) in July 1946 — prices doubled roughly every 15 hours. This is the highest hyperinflation episode ever documented, exceeding both Zimbabwe (2008, ~7.96x10^10% peak monthly) and Weimar Germany (1923). It is a settled historical fact with no staleness risk.",
    value: "4.19e16",
    claimType: "CONSTRUCTION", epistemicStatus: "SOURCE_CONFIRMED", limitStatus: "OPEN",
    methodSummary: "Documented in the Hanke-Krus World Hyperinflation Table (Johns Hopkins University / Cato Institute), the standard academic reference for hyperinflation episodes.",
    source: { title: "Hanke-Krus World Hyperinflation Table", url: "https://www.cato.org/sites/cato.org/files/pubs/pdf/hanke-krus-hyperinflation-table.pdf", date: "1946-07-01", location: "Hungary" },
  },
  {
    registryNumber: "LR-FED-FUNDS-RATE-PEAK", slug: "fed-funds-rate-peak", title: "Highest U.S. Federal Reserve policy rate",
    category: "Economics", subcategory: "Monetary Policy", direction: "MAXIMIZE",
    metricName: "Monthly average effective U.S. federal funds rate", unit: "%",
    formalStatement: "The highest monthly average effective federal funds rate ever recorded by the U.S. Federal Reserve, per FRED (Federal Reserve Economic Data). Scoped specifically to the U.S. Federal Reserve rather than all central banks globally — crisis-era emerging-market policy rates are inconsistently defined and reported across sources, so no single clean cross-country record could be verified.",
    summary: "The U.S. federal funds rate's monthly average effective value peaked at 19.10% in June 1981, during the Volcker-era Federal Reserve's campaign against double-digit inflation. The daily effective rate briefly touched even higher levels within that period.",
    value: "19.10",
    claimType: "CONSTRUCTION", epistemicStatus: "SOURCE_CONFIRMED", limitStatus: "OPEN",
    methodSummary: "Federal Reserve Economic Data (FRED), Federal Reserve Bank of St. Louis — the primary source for U.S. interest-rate history.",
    source: { title: "FRED — Federal Funds Effective Rate", url: "https://fred.stlouisfed.org/series/FEDFUNDS", date: "1981-06-01", location: "Federal Reserve Bank of St. Louis" },
  },
  {
    registryNumber: "LR-NEGATIVE-POLICY-RATE", slug: "negative-policy-rate", title: "Most negative central bank policy rate",
    category: "Economics", subcategory: "Monetary Policy", direction: "MINIMIZE",
    metricName: "Most negative policy interest rate set by a major central bank", unit: "%",
    formalStatement: "The most negative policy interest rate (rate on commercial bank sight deposits held at the central bank) ever set by a major, closely-tracked central bank.",
    summary: "The Swiss National Bank set a policy rate of -0.75% on sight deposits from January 15, 2015 to September 2022 — the deepest negative rate among the European Central Bank (bottomed at -0.50%) and Bank of Japan (-0.10%). Denmark's Nationalbank ran a negative-rate regime over a longer span (2012-2022), but sources disagree on whether its trough matched or exceeded -0.75% depending on which specific rate is measured, so this record is scoped to the SNB's unambiguous figure.",
    value: "-0.75",
    claimType: "CONSTRUCTION", epistemicStatus: "SOURCE_CONFIRMED", limitStatus: "OPEN",
    methodSummary: "Swiss National Bank's own published policy rate decisions.",
    source: { title: "Swiss National Bank — policy rate decisions", url: "https://www.snb.ch/en/publications/communication/speeches/2016/ref_20161024_tjn", date: "2015-01-15", location: "Swiss National Bank" },
  },
  {
    registryNumber: "LR-AUCTION-PRICE-RECORD", slug: "auction-price-record", title: "Highest price for an artwork at public auction",
    category: "Economics", subcategory: "Auctions", direction: "MAXIMIZE",
    metricName: "Hammer-plus-fees price paid for a single artwork at public auction", unit: "USD",
    formalStatement: "The highest price ever paid for a single artwork sold at a public (non-private) auction.",
    summary: "Leonardo da Vinci's Salvator Mundi sold for $450.3 million at Christie's New York on November 15, 2017 — still standing as the record as of 2026, with the current runner-up (Klimt's Portrait of Elisabeth Lederer, $236.4M, November 2025) less than half its price. The painting's attribution to Leonardo (versus workshop assistance) has long been disputed by some art historians, and its current owner and location have been undisclosed since the sale.",
    value: "450300000",
    claimType: "CONSTRUCTION", epistemicStatus: "SOURCE_CONFIRMED", limitStatus: "OPEN",
    methodSummary: "Christie's auction house sale record, widely reported by Reuters, CBS News, and ArtNews.",
    source: { title: "ArtNews — Most expensive artworks ever sold at auction", url: "https://www.artnews.com/list/art-news/market/most-expensive-artworks-ever-sold-at-auction-1234736898/", date: "2017-11-15", location: "Christie's, New York, USA" },
  },
  {
    registryNumber: "LR-TRADING-VOLUME-RECORD", slug: "trading-volume-record", title: "Highest single-day trading volume, single exchange",
    category: "Economics", subcategory: "Trading", direction: "MAXIMIZE",
    metricName: "Shares traded in a single day on the NYSE", unit: "shares",
    formalStatement: "The highest number of shares traded in a single day on NYSE Equities, per Intercontinental Exchange (ICE), the exchange's operator.",
    summary: "NYSE Equities recorded a single-day volume of 7 billion shares traded at some point during 2025 — four of the five highest-volume days in NYSE history occurred that year, per ICE's own 2025 markets report. ICE's release did not disclose the exact calendar date. This is a share-count record, distinct from a dollar-value record; ICE separately reported a same-year closing-auction record of over $205 billion traded in a single day's close.",
    value: "7000000000",
    claimType: "CONSTRUCTION", epistemicStatus: "SOURCE_CONFIRMED", limitStatus: "OPEN",
    methodSummary: "Intercontinental Exchange (ICE), owner and operator of NYSE — primary-source press release.",
    source: { title: "ICE — 2025 Records Across Global Derivative and NYSE Equity Markets", url: "https://s2.q4cdn.com/154085107/files/doc_news/ICE-Announces-2025-Records-Across-Its-Global-Derivative-and-NYSE-Equity--NYSE-Options-Markets-2026.pdf", date: "2025-01-01", location: "NYSE Equities" },
  },
];
