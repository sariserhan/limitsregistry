// 150 additional real MIPLIB 2017 (v36) proven-optimal benchmark instances, beyond the
// 232-instance curated benchmark-v2.test subset already published. Parsed once from the official
// solution catalog already in this repo (data/miplib2017-v36.solu) and embedded as a literal so
// the admin seed route has no runtime filesystem dependency. Only rows with status =opt= (a
// rigorously proven optimal objective, not just a best-known feasible solution) are included —
// same bar the existing 232-instance import uses. Registry numbers continue from LR-002232
// (index 232) so they cannot collide with the existing benchmark-subset import.
export type MiplibExtraRecord = { instance: string; objective: string };

export const MIPLIB_EXTRA: MiplibExtraRecord[] = [
  {
    "instance": "drayage-25-27",
    "objective": "102183.505325"
  },
  {
    "instance": "drayage-25-32",
    "objective": "91395.84915"
  },
  {
    "instance": "drayage-100-12",
    "objective": "94941.5891075"
  },
  {
    "instance": "neos-933638",
    "objective": "275.9999999999998"
  },
  {
    "instance": "ofi",
    "objective": "6155380000"
  },
  {
    "instance": "neos-941313",
    "objective": "9360.999999999985"
  },
  {
    "instance": "cvs16r89-60",
    "objective": "-65"
  },
  {
    "instance": "in",
    "objective": "58"
  },
  {
    "instance": "noswot",
    "objective": "-41.00000885"
  },
  {
    "instance": "wnq-n100-mw99-14",
    "objective": "259"
  },
  {
    "instance": "s55",
    "objective": "-22.15177316"
  },
  {
    "instance": "lectsched-1",
    "objective": "0"
  },
  {
    "instance": "gasprod1-3",
    "objective": "2310.0993127"
  },
  {
    "instance": "gasprod1-2",
    "objective": "983.039488258"
  },
  {
    "instance": "academictimetablebig",
    "objective": "427"
  },
  {
    "instance": "rmatr100-p5",
    "objective": "976"
  },
  {
    "instance": "gen-ip021",
    "objective": "2361.45419519"
  },
  {
    "instance": "gen-ip036",
    "objective": "-4606.67961"
  },
  {
    "instance": "gen-ip016",
    "objective": "-9476.155197"
  },
  {
    "instance": "comp08-2idx",
    "objective": "37"
  },
  {
    "instance": "aflow40b",
    "objective": "1168"
  },
  {
    "instance": "map14860-20",
    "objective": "-922"
  },
  {
    "instance": "cvs16r106-72",
    "objective": "-81"
  },
  {
    "instance": "neos-555424",
    "objective": "1286800"
  },
  {
    "instance": "vpphard",
    "objective": "5"
  },
  {
    "instance": "ns1111636",
    "objective": "162"
  },
  {
    "instance": "neos-885086",
    "objective": "-243"
  },
  {
    "instance": "sp98ic",
    "objective": "449144758.4"
  },
  {
    "instance": "neos-831188",
    "objective": "2.613774619999999"
  },
  {
    "instance": "mkc1",
    "objective": "-607.20703"
  },
  {
    "instance": "neos-555001",
    "objective": "1210625"
  },
  {
    "instance": "p500x2988",
    "objective": "71835.999996"
  },
  {
    "instance": "neos-1425699",
    "objective": "3179698976.996124"
  },
  {
    "instance": "ta2-UUE",
    "objective": "37871728.59"
  },
  {
    "instance": "misc07",
    "objective": "2810"
  },
  {
    "instance": "dsbmip",
    "objective": "-305.19817501"
  },
  {
    "instance": "air03",
    "objective": "340160"
  },
  {
    "instance": "neos-807639",
    "objective": "454.1999999999998"
  },
  {
    "instance": "a2c1s1",
    "objective": "10889.137625"
  },
  {
    "instance": "neos-555884",
    "objective": "1232700"
  },
  {
    "instance": "Test3",
    "objective": "2673520.21135"
  },
  {
    "instance": "lrn",
    "objective": "44479255.12362"
  },
  {
    "instance": "neos-1516309",
    "objective": "35954"
  },
  {
    "instance": "haprp",
    "objective": "3673280.6808"
  },
  {
    "instance": "rout",
    "objective": "1077.559999999999"
  },
  {
    "instance": "neos-1599274",
    "objective": "32075.6"
  },
  {
    "instance": "nh97_potential",
    "objective": "1418"
  },
  {
    "instance": "mod011",
    "objective": "-54558535.59"
  },
  {
    "instance": "sp97ic",
    "objective": "427684487.6799999"
  },
  {
    "instance": "blend2",
    "objective": "7.598985"
  },
  {
    "instance": "rococoC12-010001",
    "objective": "34045.0"
  },
  {
    "instance": "gr4x6",
    "objective": "202.3499999999979"
  },
  {
    "instance": "n6-3",
    "objective": "15174.999303"
  },
  {
    "instance": "h50x2450",
    "objective": "32906.880834"
  },
  {
    "instance": "bley_xs2",
    "objective": "1051266.38"
  },
  {
    "instance": "neos-780889",
    "objective": "3421500"
  },
  {
    "instance": "neos-956971",
    "objective": "-237.7688889"
  },
  {
    "instance": "n7-3",
    "objective": "15425.99999997"
  },
  {
    "instance": "germany50-UUM",
    "objective": "628490"
  },
  {
    "instance": "enlight8",
    "objective": "27"
  },
  {
    "instance": "p0201",
    "objective": "7614.999999999997"
  },
  {
    "instance": "neos-876808",
    "objective": "169795.259907"
  },
  {
    "instance": "nsa",
    "objective": "120"
  },
  {
    "instance": "neos-1367061",
    "objective": "31320456.264"
  },
  {
    "instance": "30_70_45_095_98",
    "objective": "11.99999999999999"
  },
  {
    "instance": "neos-933562",
    "objective": "17.99999999999975"
  },
  {
    "instance": "neos-565672",
    "objective": "90693.549539"
  },
  {
    "instance": "nu120-pr12",
    "objective": "42215"
  },
  {
    "instance": "mik-250-20-75-5",
    "objective": "-51532"
  },
  {
    "instance": "neos-1067731",
    "objective": "1025102"
  },
  {
    "instance": "markshare1",
    "objective": "0.9999999999990905"
  },
  {
    "instance": "mik-250-20-75-3",
    "objective": "-52242"
  },
  {
    "instance": "neos-914441",
    "objective": "9347771.999999987"
  },
  {
    "instance": "neos-1324574",
    "objective": "7.999999999999998"
  },
  {
    "instance": "neos22",
    "objective": "779714.9999999997"
  },
  {
    "instance": "berlin",
    "objective": "1043.999999997141"
  },
  {
    "instance": "neos-829552",
    "objective": "2.31958979"
  },
  {
    "instance": "neos-1445743",
    "objective": "-17905"
  },
  {
    "instance": "neos-957143",
    "objective": "-237.7688889"
  },
  {
    "instance": "manna81",
    "objective": "-13164"
  },
  {
    "instance": "neos-827015",
    "objective": "2.31958979"
  },
  {
    "instance": "bc1",
    "objective": "3.3383625476"
  },
  {
    "instance": "icir97_potential",
    "objective": "6325"
  },
  {
    "instance": "swath2",
    "objective": "385.1996929499999"
  },
  {
    "instance": "neos-799716",
    "objective": "4932670.66169"
  },
  {
    "instance": "bienst1",
    "objective": "46.7499999999999"
  },
  {
    "instance": "neos-826224",
    "objective": "121"
  },
  {
    "instance": "fiber",
    "objective": "405935.18"
  },
  {
    "instance": "prod1",
    "objective": "-56"
  },
  {
    "instance": "arki001",
    "objective": "7580813.0459"
  },
  {
    "instance": "ran12x21",
    "objective": "3663.999999980964"
  },
  {
    "instance": "neos-595904",
    "objective": "64829.59"
  },
  {
    "instance": "neos-480878",
    "objective": "492.5144492879"
  },
  {
    "instance": "beasleyC1",
    "objective": "84.99999999999999"
  },
  {
    "instance": "ns2071214",
    "objective": "507"
  },
  {
    "instance": "30_70_45_05_100",
    "objective": "9"
  },
  {
    "instance": "qnet1",
    "objective": "16029.69268099998"
  },
  {
    "instance": "ds",
    "objective": "93.52"
  },
  {
    "instance": "neos-953928",
    "objective": "-99.9044444446"
  },
  {
    "instance": "khb05250",
    "objective": "106940225.9999999"
  },
  {
    "instance": "nexp-50-20-1-1",
    "objective": "28.99999999999999"
  },
  {
    "instance": "k16x240b",
    "objective": "11392.99999884458"
  },
  {
    "instance": "neos-850681",
    "objective": "2472"
  },
  {
    "instance": "p500x2988d",
    "objective": "6"
  },
  {
    "instance": "neos-935234",
    "objective": "2431.999999999996"
  },
  {
    "instance": "mik-250-20-75-2",
    "objective": "-50768.00000000001"
  },
  {
    "instance": "opt1217",
    "objective": "-16.00000000000012"
  },
  {
    "instance": "22433",
    "objective": "21477"
  },
  {
    "instance": "nexp-50-20-4-2",
    "objective": "70.99999999999999"
  },
  {
    "instance": "neos-631517",
    "objective": "11490666.665"
  },
  {
    "instance": "neos-1430701",
    "objective": "-77.00000000000182"
  },
  {
    "instance": "ic97_tension",
    "objective": "3942"
  },
  {
    "instance": "ab69-40-100",
    "objective": "-11186281442"
  },
  {
    "instance": "neos-1593097",
    "objective": "23136"
  },
  {
    "instance": "neos-948346",
    "objective": "-227.6"
  },
  {
    "instance": "neos-1445532",
    "objective": "-17041"
  },
  {
    "instance": "mc7",
    "objective": "3417"
  },
  {
    "instance": "mtest4ma",
    "objective": "52148"
  },
  {
    "instance": "neos-932721",
    "objective": "52030"
  },
  {
    "instance": "ab71-20-100",
    "objective": "-10420305975"
  },
  {
    "instance": "h80x6320",
    "objective": "3700"
  },
  {
    "instance": "brasil",
    "objective": "13655"
  },
  {
    "instance": "ab51-40-100",
    "objective": "-10420305975"
  },
  {
    "instance": "neos-1603965",
    "objective": "619244367.662956"
  },
  {
    "instance": "prod2",
    "objective": "-62"
  },
  {
    "instance": "neos-1061020",
    "objective": "-142745.3"
  },
  {
    "instance": "10teams",
    "objective": "923.9999999999997"
  },
  {
    "instance": "neos-1445738",
    "objective": "-17380"
  },
  {
    "instance": "neos2",
    "objective": "454.86469703"
  },
  {
    "instance": "aligninq",
    "objective": "2712.999999999999"
  },
  {
    "instance": "beasleyC2",
    "objective": "144"
  },
  {
    "instance": "gt2",
    "objective": "21165.99999999978"
  },
  {
    "instance": "neos-983171",
    "objective": "2360"
  },
  {
    "instance": "neos4",
    "objective": "-48603440751"
  },
  {
    "instance": "neos-691058",
    "objective": "296.999999999986"
  },
  {
    "instance": "n13-3",
    "objective": "13385"
  },
  {
    "instance": "mik-250-20-75-1",
    "objective": "-49716"
  },
  {
    "instance": "23588",
    "objective": "8089.999999999998"
  },
  {
    "instance": "blp-ir98",
    "objective": "2342.315488"
  },
  {
    "instance": "ran13x13",
    "objective": "3252"
  },
  {
    "instance": "r50x360",
    "objective": "1653"
  },
  {
    "instance": "nh97_tension",
    "objective": "1418"
  },
  {
    "instance": "g200x740",
    "objective": "44316"
  },
  {
    "instance": "rlp1",
    "objective": "14.99999999990919"
  },
  {
    "instance": "eilC76-2",
    "objective": "762.514781999996"
  },
  {
    "instance": "nexp-150-20-1-5",
    "objective": "66"
  },
  {
    "instance": "rococoC11-010100",
    "objective": "20889"
  },
  {
    "instance": "neos-585192",
    "objective": "461.1797"
  },
  {
    "instance": "mod010",
    "objective": "6548"
  },
  {
    "instance": "flugpl",
    "objective": "1201500"
  }
];
