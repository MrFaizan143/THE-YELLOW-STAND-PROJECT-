/**
 * team.js — TYS 2026 Data Layer
 * Single source of truth for all fixtures, squad, and staff data.
 * Update this file to reflect new fixtures or squad changes.
 */

const DATA = {

    /** Next match details (used by countdown) */
    nextMatch: {
        date: "March 30, 2026 19:30:00",
        opponent: "RR",
        label: "March 30 vs RR"
    },

    /** Full fixture list */
    fixtures: [
        { d: "30 MAR", o: "Rajasthan Royals",  v: "Guwahati" },
        { d: "03 APR", o: "Punjab Kings",       v: "Chennai"  },
        { d: "05 APR", o: "RCB",                v: "Bengaluru" },
        { d: "11 APR", o: "Delhi Capitals",     v: "Chennai"  }
    ],

    /** Squad organised by category */
    squad: {
        "Batters": [
            "Ruturaj Gaikwad (C)",
            "Sarfaraz Khan",
            "Dewald Brevis",
            "Ayush Mhatre"
        ],
        "Keepers": [
            "MS Dhoni",
            "Sanju Samson",
            "Urvil Patel",
            "Kartik Sharma"
        ],
        "All-Rounders": [
            "Shivam Dube",
            "Jamie Overton",
            "Matthew Short",
            "Aman Hakim Khan",
            "Prashant Veer",
            "R. Ghosh",
            "Zakary Foulkes"
        ],
        "Bowlers": [
            "Khaleel Ahmed",
            "M. Choudhary",
            "Nathan Ellis",
            "Matt Henry",
            "Anshul Kamboj",
            "Gurjapneet Singh",
            "Noor Ahmad",
            "Rahul Chahar",
            "Akeal Hosein",
            "Shreyas Gopal"
        ]
    },

    /**
     * Head-to-head records: CSK vs every IPL team.
     * Fields: team, shortName, played, wins, losses, keyMoment
     * Records cover IPL 2008–2024 (CSK absent 2016–2017).
     */
    h2h: [
        {
            team: "Mumbai Indians",
            short: "MI",
            played: 37,
            wins: 18,
            losses: 19,
            moment: "2010 Final — CSK's first title. 2019 Final — MI edged CSK in a thriller."
        },
        {
            team: "Royal Challengers Bengaluru",
            short: "RCB",
            played: 33,
            wins: 21,
            losses: 12,
            moment: "2011 Final — CSK crushed RCB by 58 runs to clinch back-to-back titles."
        },
        {
            team: "Kolkata Knight Riders",
            short: "KKR",
            played: 30,
            wins: 19,
            losses: 11,
            moment: "2012 & 2021 Finals — KKR's two titles both came at CSK's expense."
        },
        {
            team: "Rajasthan Royals",
            short: "RR",
            played: 27,
            wins: 15,
            losses: 12,
            moment: "2008 Final — RR beat CSK to win the inaugural IPL title."
        },
        {
            team: "Delhi Capitals",
            short: "DC",
            played: 31,
            wins: 20,
            losses: 11,
            moment: "2012 Qualifier — CSK eliminated Delhi to reach the final."
        },
        {
            team: "Punjab Kings",
            short: "PBKS",
            played: 32,
            wins: 20,
            losses: 12,
            moment: "CSK's most dominant H2H record — won 7 of the last 9 meetings."
        },
        {
            team: "Sunrisers Hyderabad",
            short: "SRH",
            played: 23,
            wins: 13,
            losses: 10,
            moment: "2018 Final — CSK beat SRH to clinch their third IPL title."
        },
        {
            team: "Gujarat Titans",
            short: "GT",
            played: 10,
            wins: 5,
            losses: 5,
            moment: "2023 Final — Dhoni's last-over heroics sealed CSK's 5th title vs GT."
        },
        {
            team: "Lucknow Super Giants",
            short: "LSG",
            played: 9,
            wins: 4,
            losses: 5,
            moment: "Newest rivalry; LSG hold a slight edge in the early head-to-head."
        },
        {
            team: "Deccan Chargers",
            short: "DC*",
            played: 14,
            wins: 9,
            losses: 5,
            moment: "Defunct (2008–2012). CSK dominated en route to their 2010 title run."
        },
        {
            team: "Rising Pune Supergiant",
            short: "RPS*",
            played: 5,
            wins: 2,
            losses: 3,
            moment: "Defunct (2016–17). RPS replaced CSK during the ban years."
        },
        {
            team: "Pune Warriors India",
            short: "PWI*",
            played: 6,
            wins: 5,
            losses: 1,
            moment: "Defunct (2011–13). CSK won 5 of 6 meetings convincingly."
        },
        {
            team: "Kochi Tuskers Kerala",
            short: "KTK*",
            played: 2,
            wins: 2,
            losses: 0,
            moment: "Defunct (2011 only). CSK won both games in the single season."
        }
    ],

    /** Support staff: [role, name] pairs */
    staff: [
        ["Head Coach",      "Stephen Fleming"],
        ["Batting Coach",   "Michael Hussey"],
        ["Bowling Cons.",   "Eric Simons"],
        ["Fielding Coach",  "James Foster"],
        ["Team Manager",    "R. Radhakrishnan"],
        ["Doctor",          "Dr. Thottapillil"]
    ]
};
