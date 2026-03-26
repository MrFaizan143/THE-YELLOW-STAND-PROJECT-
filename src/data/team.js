/**
 * team.js — TYS 2026 Data Layer
 * Single source of truth for all fixtures, squad, and staff data.
 * Update this file to reflect new fixtures or squad changes.
 */

const DATA = {

    /** Next match details (used by countdown and Hub venue card) */
    nextMatch: {
        date: "March 30, 2026 19:30:00",
        opponent: "RR",
        label: "March 30 vs RR",
        venue: "Barsapara Cricket Stadium",
        city: "Guwahati",
        pitch: "Expected to be a batting-friendly surface"
    },

    /**
     * Most recently played result — update after each match.
     * result: 'W' | 'L' | 'N' | null (null = no games played yet)
     */
    lastResult: {
        opponent: "—",
        date: "—",
        result: null,
        score: "Season yet to begin"
    },

    /**
     * Full fixture list
     * d: display date   t: display time (IST)   o: opponent   v: venue   b: broadcast
     * iso: ISO-8601 match start in IST (UTC+5:30) used for auto-detecting the next match
     */
    fixtures: [
        { d: "30 MAR", t: "7:30 PM",  o: "Rajasthan Royals",           v: "Barsapara, Guwahati",        b: "Star Sports / JioCinema", iso: "2026-03-30T14:00:00Z", home: false },
        { d: "03 APR", t: "7:30 PM",  o: "Punjab Kings",                v: "Chidambaram, Chennai",       b: "Star Sports / JioCinema", iso: "2026-04-03T14:00:00Z", home: true  },
        { d: "05 APR", t: "3:30 PM",  o: "Royal Challengers Bengaluru", v: "Chinnaswamy, Bengaluru",     b: "Star Sports / JioCinema", iso: "2026-04-05T10:00:00Z", home: false },
        { d: "11 APR", t: "7:30 PM",  o: "Delhi Capitals",              v: "Chidambaram, Chennai",       b: "Star Sports / JioCinema", iso: "2026-04-11T14:00:00Z", home: true  },
        { d: "14 APR", t: "7:30 PM",  o: "Gujarat Titans",              v: "Narendra Modi, Ahmedabad",   b: "Star Sports / JioCinema", iso: "2026-04-14T14:00:00Z", home: false },
        { d: "17 APR", t: "7:30 PM",  o: "Sunrisers Hyderabad",         v: "Chidambaram, Chennai",       b: "Star Sports / JioCinema", iso: "2026-04-17T14:00:00Z", home: true  },
        { d: "20 APR", t: "3:30 PM",  o: "Mumbai Indians",              v: "Wankhede, Mumbai",           b: "Star Sports / JioCinema", iso: "2026-04-20T10:00:00Z", home: false },
        { d: "26 APR", t: "7:30 PM",  o: "Kolkata Knight Riders",       v: "Chidambaram, Chennai",       b: "Star Sports / JioCinema", iso: "2026-04-26T14:00:00Z", home: true  },
        { d: "29 APR", t: "7:30 PM",  o: "Lucknow Super Giants",        v: "Ekana, Lucknow",             b: "Star Sports / JioCinema", iso: "2026-04-29T14:00:00Z", home: false },
        { d: "03 MAY", t: "3:30 PM",  o: "Rajasthan Royals",            v: "Chidambaram, Chennai",       b: "Star Sports / JioCinema", iso: "2026-05-03T10:00:00Z", home: true  },
        { d: "07 MAY", t: "7:30 PM",  o: "Punjab Kings",                v: "New PCA, Mullanpur",         b: "Star Sports / JioCinema", iso: "2026-05-07T14:00:00Z", home: false },
        { d: "11 MAY", t: "7:30 PM",  o: "Delhi Capitals",              v: "Arun Jaitley, Delhi",        b: "Star Sports / JioCinema", iso: "2026-05-11T14:00:00Z", home: false },
        { d: "15 MAY", t: "7:30 PM",  o: "Gujarat Titans",              v: "Chidambaram, Chennai",       b: "Star Sports / JioCinema", iso: "2026-05-15T14:00:00Z", home: true  },
        { d: "18 MAY", t: "7:30 PM",  o: "Sunrisers Hyderabad",         v: "Rajiv Gandhi, Hyderabad",    b: "Star Sports / JioCinema", iso: "2026-05-18T14:00:00Z", home: false }
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

    /** Support staff: [role, name] pairs */
    staff: [
        ["Head Coach",      "Stephen Fleming"],
        ["Batting Coach",   "Michael Hussey"],
        ["Bowling Cons.",   "Eric Simons"],
        ["Fielding Coach",  "James Foster"],
        ["Team Manager",    "R. Radhakrishnan"],
        ["Doctor",          "Dr. Thottapillil"]
    ],

    /**
     * Management section — ownership, coaching panel, and support staff
     * shown on the Pride page under a dedicated "Management" heading.
     */
    management: {
        ownership: [
            {
                role:   "Chairman & Owner",
                name:   "N. Srinivasan",
                org:    "India Cements Ltd.",
                bio:    "Driving force behind CSK's founding and five IPL titles. Former BCCI President and ICC Chairman.",
                emoji:  "👑"
            },
            {
                role:   "CEO",
                name:   "Kasi Viswanathan",
                org:    "Chennai Super Kings",
                bio:    "Oversees the commercial, operational, and strategic direction of the franchise.",
                emoji:  "🏢"
            }
        ],
        coaching: [
            {
                role:   "Head Coach",
                name:   "Stephen Fleming",
                nat:    "🇳🇿",
                detail: "12-year partnership with CSK. Former New Zealand captain. Architect of the most successful franchise coaching era in IPL history."
            },
            {
                role:   "Batting Coach",
                name:   "Michael Hussey",
                nat:    "🇦🇺",
                detail: "Known as 'Mr. Cricket'. Former Australian Test great and one of the finest tacticians of batting in the shortest format."
            },
            {
                role:   "Bowling Consultant",
                name:   "Eric Simons",
                nat:    "🇿🇦",
                detail: "Former South African all-rounder and coach. Oversees the bowling unit's game plans and development."
            },
            {
                role:   "Fielding Coach",
                name:   "James Foster",
                nat:    "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
                detail: "Former England wicketkeeper. Responsible for CSK's sharp fielding standards and safe hands culture."
            }
        ],
        support: [
            { role: "Team Manager",             name: "R. Radhakrishnan" },
            { role: "Team Doctor",              name: "Dr. Thottapillil"  },
            { role: "Physiotherapist",          name: "Tommy Simsek"      },
            { role: "Strength & Conditioning",  name: "Raj Bapat"         },
            { role: "Video Analyst",            name: "Jonathan Rose"     }
        ]
    },

    /**
     * Extra player details keyed by the exact name strings used in squad above.
     * nat: 3-letter country code displayed as a flag badge.
     * flag: Unicode emoji flag.
     * role: descriptive role label shown as a sub-badge on the player card.
     * jersey: squad number.
     * age: age during the 2026 season.
     * bat: batting hand/style.
     * bowl: bowling style.
     * vc: true if the player is the vice-captain.
     */
    playerDetails: {
        "Ruturaj Gaikwad (C)": { nat: "IND", flag: "🇮🇳", role: "Top order",       jersey: 31, age: 27, bat: "Right-hand",  bowl: "Right-arm off-break",     vc: false,
            career: { ipl: { matches: 98,  runs: 2914, avg: 31.7, sr: 133.5, hs: 101, wkts: 0,  eco: null,  bowlAvg: null  } } },
        "Sarfaraz Khan":        { nat: "IND", flag: "🇮🇳", role: "Middle order",    jersey: 45, age: 27, bat: "Right-hand",  bowl: "Right-arm off-break",     vc: false,
            career: { ipl: { matches: 31,  runs: 612,  avg: 22.6, sr: 144.2, hs: 71,  wkts: 0,  eco: null,  bowlAvg: null  } } },
        "Dewald Brevis":        { nat: "RSA", flag: "🇿🇦", role: "Top order",       jersey: 52, age: 21, bat: "Right-hand",  bowl: "Right-arm off-break",     vc: false,
            career: { ipl: { matches: 28,  runs: 481,  avg: 19.2, sr: 151.7, hs: 49,  wkts: 1,  eco: 9.2,   bowlAvg: null  } } },
        "Ayush Mhatre":         { nat: "IND", flag: "🇮🇳", role: "Top order",       jersey: 83, age: 18, bat: "Right-hand",  bowl: "Right-arm medium",        vc: false,
            career: { ipl: { matches: 4,   runs: 87,   avg: 21.8, sr: 139.4, hs: 38,  wkts: 0,  eco: null,  bowlAvg: null  } } },
        "MS Dhoni":             { nat: "IND", flag: "🇮🇳", role: "Wicket-keeper",   jersey:  7, age: 44, bat: "Right-hand",  bowl: "Right-arm medium",        vc: false,
            career: { ipl: { matches: 264, runs: 5082, avg: 37.6, sr: 135.2, hs: 84,  wkts: 1,  eco: 8.3,   bowlAvg: null  } } },
        "Sanju Samson":         { nat: "IND", flag: "🇮🇳", role: "Wicket-keeper",   jersey:  8, age: 31, bat: "Right-hand",  bowl: "Right-arm off-break",     vc: false,
            career: { ipl: { matches: 184, runs: 4490, avg: 26.7, sr: 138.3, hs: 119, wkts: 0,  eco: null,  bowlAvg: null  } } },
        "Urvil Patel":          { nat: "IND", flag: "🇮🇳", role: "Wicket-keeper",   jersey: 95, age: 23, bat: "Right-hand",  bowl: "Right-arm off-break",     vc: false,
            career: { ipl: { matches: 6,   runs: 98,   avg: 16.3, sr: 148.5, hs: 43,  wkts: 0,  eco: null,  bowlAvg: null  } } },
        "Kartik Sharma":        { nat: "IND", flag: "🇮🇳", role: "Wicket-keeper",   jersey: 62, age: 21, bat: "Right-hand",  bowl: "Right-arm off-break",     vc: false,
            career: { ipl: { matches: 2,   runs: 17,   avg: 8.5,  sr: 113.3, hs: 11,  wkts: 0,  eco: null,  bowlAvg: null  } } },
        "Shivam Dube":          { nat: "IND", flag: "🇮🇳", role: "Finisher",        jersey: 21, age: 31, bat: "Left-hand",   bowl: "Right-arm medium-fast",   vc: true,
            career: { ipl: { matches: 82,  runs: 1451, avg: 26.4, sr: 151.3, hs: 95,  wkts: 11, eco: 9.8,   bowlAvg: 42.6  } } },
        "Jamie Overton":        { nat: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", role: "All-rounder",    jersey: 14, age: 29, bat: "Right-hand",  bowl: "Right-arm fast-medium",   vc: false,
            career: { ipl: { matches: 8,   runs: 142,  avg: 23.7, sr: 158.4, hs: 37,  wkts: 6,  eco: 9.1,   bowlAvg: 33.5  } } },
        "Matthew Short":        { nat: "AUS", flag: "🇦🇺", role: "All-rounder",     jersey: 59, age: 27, bat: "Right-hand",  bowl: "Right-arm off-break",     vc: false,
            career: { ipl: { matches: 12,  runs: 231,  avg: 21.0, sr: 141.2, hs: 62,  wkts: 4,  eco: 7.6,   bowlAvg: 38.0  } } },
        "Aman Hakim Khan":      { nat: "IND", flag: "🇮🇳", role: "All-rounder",     jersey: 77, age: 22, bat: "Right-hand",  bowl: "Right-arm medium",        vc: false,
            career: { ipl: { matches: 5,   runs: 41,   avg: 13.7, sr: 122.9, hs: 22,  wkts: 2,  eco: 9.4,   bowlAvg: 40.0  } } },
        "Prashant Veer":        { nat: "IND", flag: "🇮🇳", role: "All-rounder",     jersey: 66, age: 22, bat: "Right-hand",  bowl: "Right-arm medium-fast",   vc: false,
            career: { ipl: { matches: 3,   runs: 14,   avg: 7.0,  sr: 116.7, hs: 9,   wkts: 3,  eco: 8.7,   bowlAvg: 27.3  } } },
        "R. Ghosh":             { nat: "IND", flag: "🇮🇳", role: "All-rounder",     jersey: 48, age: 20, bat: "Left-hand",   bowl: "Left-arm orthodox",       vc: false,
            career: { ipl: { matches: 4,   runs: 28,   avg: 9.3,  sr: 127.3, hs: 18,  wkts: 3,  eco: 8.1,   bowlAvg: 31.0  } } },
        "Zakary Foulkes":       { nat: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", role: "Pace",          jersey: 88, age: 22, bat: "Right-hand",  bowl: "Right-arm fast-medium",   vc: false,
            career: { ipl: { matches: 3,   runs: 8,    avg: 4.0,  sr: 88.9,  hs: 6,   wkts: 4,  eco: 8.9,   bowlAvg: 22.0  } } },
        "Khaleel Ahmed":        { nat: "IND", flag: "🇮🇳", role: "Pace",            jersey: 10, age: 27, bat: "Left-hand",   bowl: "Left-arm fast-medium",    vc: false,
            career: { ipl: { matches: 76,  runs: 89,   avg: 5.9,  sr: 97.8,  hs: 21,  wkts: 91, eco: 8.6,   bowlAvg: 26.8  } } },
        "M. Choudhary":         { nat: "IND", flag: "🇮🇳", role: "Pace",            jersey: 23, age: 29, bat: "Right-hand",  bowl: "Right-arm fast-medium",   vc: false,
            career: { ipl: { matches: 42,  runs: 44,   avg: 5.5,  sr: 91.7,  hs: 16,  wkts: 48, eco: 8.9,   bowlAvg: 28.1  } } },
        "Nathan Ellis":         { nat: "AUS", flag: "🇦🇺", role: "Pace",            jersey: 35, age: 29, bat: "Right-hand",  bowl: "Right-arm fast-medium",   vc: false,
            career: { ipl: { matches: 14,  runs: 22,   avg: 5.5,  sr: 84.6,  hs: 11,  wkts: 16, eco: 9.3,   bowlAvg: 30.4  } } },
        "Matt Henry":           { nat: "NZ",  flag: "🇳🇿", role: "Pace",            jersey: 29, age: 32, bat: "Right-hand",  bowl: "Right-arm fast-medium",   vc: false,
            career: { ipl: { matches: 6,   runs: 14,   avg: 3.5,  sr: 77.8,  hs: 8,   wkts: 9,  eco: 8.4,   bowlAvg: 21.3  } } },
        "Anshul Kamboj":        { nat: "IND", flag: "🇮🇳", role: "Pace",            jersey: 71, age: 22, bat: "Right-hand",  bowl: "Right-arm fast-medium",   vc: false,
            career: { ipl: { matches: 11,  runs: 18,   avg: 4.5,  sr: 81.8,  hs: 10,  wkts: 14, eco: 8.7,   bowlAvg: 24.6  } } },
        "Gurjapneet Singh":     { nat: "IND", flag: "🇮🇳", role: "Pace",            jersey: 90, age: 24, bat: "Right-hand",  bowl: "Right-arm fast-medium",   vc: false,
            career: { ipl: { matches: 4,   runs: 4,    avg: 2.0,  sr: 66.7,  hs: 3,   wkts: 4,  eco: 9.1,   bowlAvg: 29.8  } } },
        "Noor Ahmad":           { nat: "AFG", flag: "🇦🇫", role: "Spin",            jersey: 18, age: 20, bat: "Right-hand",  bowl: "Left-arm wrist spin",     vc: false,
            career: { ipl: { matches: 32,  runs: 31,   avg: 6.2,  sr: 77.5,  hs: 12,  wkts: 38, eco: 7.8,   bowlAvg: 23.1  } } },
        "Rahul Chahar":         { nat: "IND", flag: "🇮🇳", role: "Spin",            jersey: 40, age: 25, bat: "Right-hand",  bowl: "Right-arm leg-break",     vc: false,
            career: { ipl: { matches: 61,  runs: 79,   avg: 6.6,  sr: 86.8,  hs: 22,  wkts: 62, eco: 7.9,   bowlAvg: 26.3  } } },
        "Akeal Hosein":         { nat: "WIN", flag: "🇹🇹", role: "Spin",            jersey: 55, age: 30, bat: "Left-hand",   bowl: "Left-arm orthodox",       vc: false,
            career: { ipl: { matches: 18,  runs: 41,   avg: 8.2,  sr: 93.2,  hs: 17,  wkts: 17, eco: 8.2,   bowlAvg: 31.7  } } },
        "Shreyas Gopal":        { nat: "IND", flag: "🇮🇳", role: "Spin",            jersey: 16, age: 31, bat: "Right-hand",  bowl: "Right-arm leg-break",     vc: false,
            career: { ipl: { matches: 72,  runs: 166,  avg: 9.2,  sr: 112.9, hs: 33,  wkts: 69, eco: 8.4,   bowlAvg: 28.6  } } }
    },

    /**
     * IPL 2026 points table — update as the season progresses.
     * Columns: team, played, won, lost, nr (no result), pts, nrr.
     * CSK is listed first so it is always visible at the top of the card.
     */
    standings: [
        { team: "CSK",  played: 0, won: 0, lost: 0, nr: 0, pts: 0, nrr: "—" },
        { team: "MI",   played: 0, won: 0, lost: 0, nr: 0, pts: 0, nrr: "—" },
        { team: "RCB",  played: 0, won: 0, lost: 0, nr: 0, pts: 0, nrr: "—" },
        { team: "KKR",  played: 0, won: 0, lost: 0, nr: 0, pts: 0, nrr: "—" },
        { team: "DC",   played: 0, won: 0, lost: 0, nr: 0, pts: 0, nrr: "—" },
        { team: "RR",   played: 0, won: 0, lost: 0, nr: 0, pts: 0, nrr: "—" },
        { team: "PBKS", played: 0, won: 0, lost: 0, nr: 0, pts: 0, nrr: "—" },
        { team: "SRH",  played: 0, won: 0, lost: 0, nr: 0, pts: 0, nrr: "—" },
        { team: "GT",   played: 0, won: 0, lost: 0, nr: 0, pts: 0, nrr: "—" },
        { team: "LSG",  played: 0, won: 0, lost: 0, nr: 0, pts: 0, nrr: "—" }
    ],

    /**
     * Weekly fan poll — update question & options each week.
     * Votes are stored in localStorage; clearing the key resets voting.
     */
    poll: {
        id:       "poll_2026_w1",   /* change this string to reset all votes */
        question: "Will CSK win their 6th IPL title in 2026?",
        options:  [
            "Yes! Whistle Podu!",
            "It'll be a tough season",
            "Too early to say"
        ]
    },

    /**
     * IPL 2026 venue geocoordinates — used for the interactive map.
     * Key matches the `v` field in fixtures (exact string).
     */
    venueInfo: {
        "Barsapara, Guwahati":       { lat: 26.1158, lng: 91.7086, city: "Guwahati",   stadium: "Barsapara Cricket Stadium"                  },
        "Chidambaram, Chennai":      { lat: 13.0604, lng: 80.2784, city: "Chennai",    stadium: "MA Chidambaram Stadium"                     },
        "Chinnaswamy, Bengaluru":    { lat: 12.9785, lng: 77.5993, city: "Bengaluru",  stadium: "M. Chinnaswamy Stadium"                     },
        "Narendra Modi, Ahmedabad":  { lat: 23.0922, lng: 72.5972, city: "Ahmedabad",  stadium: "Narendra Modi Stadium"                      },
        "Wankhede, Mumbai":          { lat: 18.9388, lng: 72.8258, city: "Mumbai",     stadium: "Wankhede Stadium"                           },
        "Ekana, Lucknow":            { lat: 26.8467, lng: 80.9462, city: "Lucknow",    stadium: "BRSABV Ekana Cricket Stadium"               },
        "New PCA, Mullanpur":        { lat: 30.7046, lng: 76.7179, city: "Mullanpur",  stadium: "New PCA Stadium"                            },
        "Arun Jaitley, Delhi":       { lat: 28.6365, lng: 77.2354, city: "Delhi",      stadium: "Arun Jaitley Stadium"                       },
        "Rajiv Gandhi, Hyderabad":   { lat: 17.4055, lng: 78.5500, city: "Hyderabad",  stadium: "Rajiv Gandhi International Cricket Stadium" },
        "Eden Gardens, Kolkata":     { lat: 22.5646, lng: 88.3433, city: "Kolkata",    stadium: "Eden Gardens"                               }
    },

    /**
     * CSK Legacy — IPL title history and all-time records.
     */
    legacy: {
        titles: [
            { year: 2010, final: "CSK vs MI",  result: "CSK won by 22 runs",     venue: "DY Patil Stadium, Navi Mumbai",           captain: "MS Dhoni" },
            { year: 2011, final: "CSK vs RCB", result: "CSK won by 58 runs",     venue: "MA Chidambaram Stadium, Chennai",          captain: "MS Dhoni" },
            { year: 2018, final: "CSK vs SRH", result: "CSK won by 8 wickets",   venue: "Wankhede Stadium, Mumbai",                 captain: "MS Dhoni" },
            { year: 2021, final: "CSK vs KKR", result: "CSK won by 27 runs",     venue: "Dubai International Cricket Stadium",      captain: "MS Dhoni" },
            { year: 2023, final: "CSK vs GT",  result: "CSK won by 5 wickets",   venue: "Narendra Modi Stadium, Ahmedabad",         captain: "MS Dhoni" }
        ],
        records: [
            { label: "IPL Titles",             value: "5" },
            { label: "Finals Played",          value: "10" },
            { label: "Playoff Appearances",    value: "13/17" },
            { label: "Most Runs (CSK)",        value: "S. Raina — 5528" },
            { label: "Most Wickets (CSK)",     value: "D. Bravo — 183" },
            { label: "Most Appearances",       value: "MS Dhoni — 264" },
            { label: "Highest Team Score",     value: "246/5 vs PBKS (2010)" },
            { label: "Home Ground",            value: "MA Chidambaram Stadium" }
        ]
    },

    /**
     * Cricket trivia quiz questions — 25 questions covering CSK, IPL & general cricket.
     * q: question text  opts: 4 answer options (strings)  ans: index of correct option (0-based)
     * cat: category label — 'CSK' | 'IPL' | 'Cricket'
     */
    quiz: [
        { cat: "CSK",     q: "How many IPL titles has CSK won?",                                          opts: ["3","4","5","6"],                                                       ans: 2 },
        { cat: "CSK",     q: "Who captained CSK in all 5 title-winning seasons?",                        opts: ["Suresh Raina","MS Dhoni","Ruturaj Gaikwad","Ravindra Jadeja"],         ans: 1 },
        { cat: "CSK",     q: "What is MS Dhoni's iconic jersey number?",                                  opts: ["3","5","7","9"],                                                       ans: 2 },
        { cat: "CSK",     q: "Which stadium is CSK's home ground?",                                       opts: ["Wankhede","Eden Gardens","MA Chidambaram","Chinnaswamy"],             ans: 2 },
        { cat: "CSK",     q: "What is CSK's famous battle cry / slogan?",                                 opts: ["Jai CSK","Whistle Podu","Yellow Army","Lion Roar"],                    ans: 1 },
        { cat: "CSK",     q: "In which year did CSK win their first IPL title?",                          opts: ["2008","2009","2010","2011"],                                           ans: 2 },
        { cat: "CSK",     q: "Which player has scored the most runs for CSK in IPL history?",             opts: ["MS Dhoni","Murali Vijay","Suresh Raina","Michael Hussey"],            ans: 2 },
        { cat: "CSK",     q: "Which team did CSK beat in the 2023 IPL Final?",                            opts: ["SRH","KKR","MI","GT"],                                                 ans: 3 },
        { cat: "CSK",     q: "What is CSK's nickname?",                                                   opts: ["Super Kings","Yellow Lions","The Pride","Whistle Boys"],              ans: 0 },
        { cat: "CSK",     q: "Who is CSK's head coach in IPL 2026?",                                     opts: ["Ricky Ponting","Stephen Fleming","Mahela Jayawardene","Anil Kumble"], ans: 1 },
        { cat: "IPL",     q: "What year did the IPL start?",                                              opts: ["2006","2007","2008","2009"],                                           ans: 2 },
        { cat: "IPL",     q: "Which team has won the most IPL titles overall (before 2026)?",             opts: ["CSK","MI","KKR","RCB"],                                                ans: 1 },
        { cat: "IPL",     q: "How many teams currently compete in the IPL?",                              opts: ["8","9","10","12"],                                                     ans: 2 },
        { cat: "IPL",     q: "Which stadium hosted the 2023 IPL Final?",                                  opts: ["Wankhede","Eden Gardens","Narendra Modi Stadium","Chepauk"],          ans: 2 },
        { cat: "IPL",     q: "What is the maximum number of overs in an IPL match per side?",             opts: ["15","18","20","25"],                                                   ans: 2 },
        { cat: "Cricket", q: "How many balls are in a cricket over?",                                     opts: ["4","5","6","8"],                                                       ans: 2 },
        { cat: "Cricket", q: "What does 'LBW' stand for in cricket?",                                    opts: ["Leg Before Wicket","Left Before Wicket","Lost Ball Warning","Line Before Wicket"], ans: 0 },
        { cat: "Cricket", q: "What is a score of zero called in cricket?",                                opts: ["Blank","Nil","Duck","Golden"],                                         ans: 2 },
        { cat: "Cricket", q: "How many players are in a cricket team?",                                   opts: ["9","10","11","12"],                                                    ans: 2 },
        { cat: "Cricket", q: "What does DRS stand for in cricket?",                                      opts: ["Direct Review System","Decision Review System","Dual Referral System","Digital Review Software"], ans: 1 },
        { cat: "Cricket", q: "A batsman scores a 'century' when they reach how many runs?",               opts: ["50","75","100","150"],                                                 ans: 2 },
        { cat: "Cricket", q: "What is a 'hat-trick' in cricket?",                                         opts: ["3 sixes in a row","3 wickets in 3 consecutive balls","Scoring 50 in 3 overs","Hitting the stumps 3 times"], ans: 1 },
        { cat: "Cricket", q: "What nationality is batting legend Sachin Tendulkar?",                      opts: ["Pakistani","Sri Lankan","Indian","Bangladeshi"],                       ans: 2 },
        { cat: "Cricket", q: "What is the maximum number of overs a T20 bowler can bowl per match?",      opts: ["3","4","5","6"],                                                       ans: 1 },
        { cat: "Cricket", q: "Which fielding position is closest to the batsman, on the leg side?",       opts: ["Fine Leg","Square Leg","Silly Mid-On","Mid-Wicket"],                   ans: 2 }
    ],

    /**
     * ICC Rankings — static snapshot (updated periodically).
     * Covers Men & Women across T20I, ODI, and Test formats.
     * Each entry: { rank, team|player, rating, [country] }
     */
    iccRankings: {
        men: {
            t20i: {
                teams: [
                    { rank: 1,  team: "India",        rating: 269 },
                    { rank: 2,  team: "South Africa",  rating: 262 },
                    { rank: 3,  team: "England",       rating: 248 },
                    { rank: 4,  team: "Australia",     rating: 244 },
                    { rank: 5,  team: "West Indies",   rating: 232 },
                    { rank: 6,  team: "Pakistan",      rating: 227 },
                    { rank: 7,  team: "Afghanistan",   rating: 219 },
                    { rank: 8,  team: "New Zealand",   rating: 212 },
                    { rank: 9,  team: "Sri Lanka",     rating: 198 },
                    { rank: 10, team: "Bangladesh",    rating: 179 }
                ],
                batting: [
                    { rank: 1,  player: "Suryakumar Yadav", country: "India",       rating: 865 },
                    { rank: 2,  player: "Phil Salt",        country: "England",     rating: 776 },
                    { rank: 3,  player: "Travis Head",      country: "Australia",   rating: 758 },
                    { rank: 4,  player: "Babar Azam",       country: "Pakistan",    rating: 742 },
                    { rank: 5,  player: "Rohit Sharma",     country: "India",       rating: 731 },
                    { rank: 6,  player: "Mohammad Rizwan",  country: "Pakistan",    rating: 718 },
                    { rank: 7,  player: "Virat Kohli",      country: "India",       rating: 702 },
                    { rank: 8,  player: "David Warner",     country: "Australia",   rating: 693 },
                    { rank: 9,  player: "Jos Buttler",      country: "England",     rating: 681 },
                    { rank: 10, player: "Glenn Maxwell",    country: "Australia",   rating: 672 }
                ],
                bowling: [
                    { rank: 1,  player: "Rashid Khan",      country: "Afghanistan", rating: 793 },
                    { rank: 2,  player: "Wanindu Hasaranga",country: "Sri Lanka",   rating: 775 },
                    { rank: 3,  player: "Adil Rashid",      country: "England",     rating: 747 },
                    { rank: 4,  player: "Axar Patel",       country: "India",       rating: 721 },
                    { rank: 5,  player: "Anrich Nortje",    country: "S. Africa",   rating: 708 },
                    { rank: 6,  player: "Jasprit Bumrah",   country: "India",       rating: 698 },
                    { rank: 7,  player: "Sam Curran",       country: "England",     rating: 682 },
                    { rank: 8,  player: "Trent Boult",      country: "New Zealand", rating: 671 },
                    { rank: 9,  player: "Kagiso Rabada",    country: "S. Africa",   rating: 663 },
                    { rank: 10, player: "Shaheen Afridi",   country: "Pakistan",    rating: 657 }
                ]
            },
            odi: {
                teams: [
                    { rank: 1,  team: "Australia",    rating: 126 },
                    { rank: 2,  team: "India",        rating: 124 },
                    { rank: 3,  team: "New Zealand",  rating: 117 },
                    { rank: 4,  team: "England",      rating: 114 },
                    { rank: 5,  team: "South Africa", rating: 112 },
                    { rank: 6,  team: "Pakistan",     rating: 107 },
                    { rank: 7,  team: "Sri Lanka",    rating: 98  },
                    { rank: 8,  team: "Bangladesh",   rating: 92  },
                    { rank: 9,  team: "West Indies",  rating: 87  },
                    { rank: 10, team: "Afghanistan",  rating: 82  }
                ],
                batting: [
                    { rank: 1,  player: "Virat Kohli",      country: "India",       rating: 873 },
                    { rank: 2,  player: "Babar Azam",       country: "Pakistan",    rating: 849 },
                    { rank: 3,  player: "Rohit Sharma",     country: "India",       rating: 821 },
                    { rank: 4,  player: "Shubman Gill",     country: "India",       rating: 808 },
                    { rank: 5,  player: "Travis Head",      country: "Australia",   rating: 786 },
                    { rank: 6,  player: "Jos Buttler",      country: "England",     rating: 769 },
                    { rank: 7,  player: "Daryl Mitchell",   country: "New Zealand", rating: 751 },
                    { rank: 8,  player: "Fakhar Zaman",     country: "Pakistan",    rating: 744 },
                    { rank: 9,  player: "Glenn Maxwell",    country: "Australia",   rating: 737 },
                    { rank: 10, player: "Quinton de Kock",  country: "S. Africa",   rating: 721 }
                ],
                bowling: [
                    { rank: 1,  player: "Jasprit Bumrah",   country: "India",       rating: 819 },
                    { rank: 2,  player: "Trent Boult",      country: "New Zealand", rating: 793 },
                    { rank: 3,  player: "Shaheen Afridi",   country: "Pakistan",    rating: 776 },
                    { rank: 4,  player: "Rashid Khan",      country: "Afghanistan", rating: 762 },
                    { rank: 5,  player: "Mohammed Shami",   country: "India",       rating: 748 },
                    { rank: 6,  player: "Josh Hazlewood",   country: "Australia",   rating: 731 },
                    { rank: 7,  player: "Adam Zampa",       country: "Australia",   rating: 718 },
                    { rank: 8,  player: "Kagiso Rabada",    country: "S. Africa",   rating: 704 },
                    { rank: 9,  player: "Matt Henry",       country: "New Zealand", rating: 687 },
                    { rank: 10, player: "Kuldeep Yadav",    country: "India",       rating: 679 }
                ]
            },
            test: {
                teams: [
                    { rank: 1,  team: "India",        rating: 125 },
                    { rank: 2,  team: "Australia",    rating: 121 },
                    { rank: 3,  team: "England",      rating: 106 },
                    { rank: 4,  team: "New Zealand",  rating: 103 },
                    { rank: 5,  team: "South Africa", rating: 97  },
                    { rank: 6,  team: "Pakistan",     rating: 88  },
                    { rank: 7,  team: "Sri Lanka",    rating: 84  },
                    { rank: 8,  team: "West Indies",  rating: 73  },
                    { rank: 9,  team: "Bangladesh",   rating: 61  },
                    { rank: 10, team: "Zimbabwe",     rating: 43  }
                ],
                batting: [
                    { rank: 1,  player: "Joe Root",         country: "England",     rating: 921 },
                    { rank: 2,  player: "Marnus Labuschagne",country: "Australia",  rating: 893 },
                    { rank: 3,  player: "Steve Smith",      country: "Australia",   rating: 878 },
                    { rank: 4,  player: "Virat Kohli",      country: "India",       rating: 856 },
                    { rank: 5,  player: "Kane Williamson",  country: "New Zealand", rating: 841 },
                    { rank: 6,  player: "Babar Azam",       country: "Pakistan",    rating: 827 },
                    { rank: 7,  player: "Yashasvi Jaiswal", country: "India",       rating: 814 },
                    { rank: 8,  player: "David Warner",     country: "Australia",   rating: 798 },
                    { rank: 9,  player: "Rohit Sharma",     country: "India",       rating: 783 },
                    { rank: 10, player: "Ben Duckett",      country: "England",     rating: 769 }
                ],
                bowling: [
                    { rank: 1,  player: "Jasprit Bumrah",   country: "India",       rating: 907 },
                    { rank: 2,  player: "Pat Cummins",      country: "Australia",   rating: 884 },
                    { rank: 3,  player: "Ravichandran Ashwin",country: "India",     rating: 861 },
                    { rank: 4,  player: "James Anderson",   country: "England",     rating: 843 },
                    { rank: 5,  player: "Kagiso Rabada",    country: "S. Africa",   rating: 826 },
                    { rank: 6,  player: "Stuart Broad",     country: "England",     rating: 811 },
                    { rank: 7,  player: "Nathan Lyon",      country: "Australia",   rating: 797 },
                    { rank: 8,  player: "Shaheen Afridi",   country: "Pakistan",    rating: 783 },
                    { rank: 9,  player: "Mohammed Shami",   country: "India",       rating: 768 },
                    { rank: 10, player: "Kyle Jamieson",    country: "New Zealand", rating: 752 }
                ]
            }
        },
        women: {
            t20i: {
                teams: [
                    { rank: 1,  team: "Australia",    rating: 292 },
                    { rank: 2,  team: "England",      rating: 265 },
                    { rank: 3,  team: "India",        rating: 258 },
                    { rank: 4,  team: "New Zealand",  rating: 241 },
                    { rank: 5,  team: "South Africa", rating: 225 },
                    { rank: 6,  team: "Pakistan",     rating: 198 },
                    { rank: 7,  team: "Sri Lanka",    rating: 182 },
                    { rank: 8,  team: "West Indies",  rating: 171 },
                    { rank: 9,  team: "Bangladesh",   rating: 157 },
                    { rank: 10, team: "Ireland",      rating: 133 }
                ],
                batting: [
                    { rank: 1,  player: "Smriti Mandhana",  country: "India",       rating: 786 },
                    { rank: 2,  player: "Beth Mooney",      country: "Australia",   rating: 771 },
                    { rank: 3,  player: "Shafali Verma",    country: "India",       rating: 754 },
                    { rank: 4,  player: "Tammy Beaumont",   country: "England",     rating: 738 },
                    { rank: 5,  player: "Sophie Devine",    country: "New Zealand", rating: 719 },
                    { rank: 6,  player: "Alyssa Healy",     country: "Australia",   rating: 703 },
                    { rank: 7,  player: "Laura Wolvaardt",  country: "S. Africa",   rating: 688 },
                    { rank: 8,  player: "Harmanpreet Kaur", country: "India",       rating: 671 },
                    { rank: 9,  player: "Nat Sciver-Brunt", country: "England",     rating: 659 },
                    { rank: 10, player: "Meg Lanning",      country: "Australia",   rating: 644 }
                ],
                bowling: [
                    { rank: 1,  player: "Sophie Ecclestone",country: "England",     rating: 784 },
                    { rank: 2,  player: "Shabnim Ismail",   country: "S. Africa",   rating: 761 },
                    { rank: 3,  player: "Deepti Sharma",    country: "India",       rating: 743 },
                    { rank: 4,  player: "Megan Schutt",     country: "Australia",   rating: 727 },
                    { rank: 5,  player: "Georgia Wareham",  country: "Australia",   rating: 711 },
                    { rank: 6,  player: "Poonam Yadav",     country: "India",       rating: 698 },
                    { rank: 7,  player: "Lea Tahuhu",       country: "New Zealand", rating: 683 },
                    { rank: 8,  player: "Anisa Mohammed",   country: "West Indies", rating: 669 },
                    { rank: 9,  player: "Alana King",       country: "Australia",   rating: 654 },
                    { rank: 10, player: "Katherine Brunt",  country: "England",     rating: 641 }
                ]
            },
            odi: {
                teams: [
                    { rank: 1,  team: "Australia",    rating: 143 },
                    { rank: 2,  team: "India",        rating: 131 },
                    { rank: 3,  team: "England",      rating: 122 },
                    { rank: 4,  team: "New Zealand",  rating: 118 },
                    { rank: 5,  team: "South Africa", rating: 109 },
                    { rank: 6,  team: "Pakistan",     rating: 96  },
                    { rank: 7,  team: "Sri Lanka",    rating: 87  },
                    { rank: 8,  team: "Bangladesh",   rating: 72  },
                    { rank: 9,  team: "West Indies",  rating: 67  },
                    { rank: 10, team: "Ireland",      rating: 59  }
                ],
                batting: [
                    { rank: 1,  player: "Smriti Mandhana",  country: "India",       rating: 799 },
                    { rank: 2,  player: "Nat Sciver-Brunt", country: "England",     rating: 771 },
                    { rank: 3,  player: "Meg Lanning",      country: "Australia",   rating: 754 },
                    { rank: 4,  player: "Harmanpreet Kaur", country: "India",       rating: 736 },
                    { rank: 5,  player: "Beth Mooney",      country: "Australia",   rating: 718 },
                    { rank: 6,  player: "Laura Wolvaardt",  country: "S. Africa",   rating: 703 },
                    { rank: 7,  player: "Amy Jones",        country: "England",     rating: 687 },
                    { rank: 8,  player: "Sophie Devine",    country: "New Zealand", rating: 671 },
                    { rank: 9,  player: "Deepti Sharma",    country: "India",       rating: 658 },
                    { rank: 10, player: "Tammy Beaumont",   country: "England",     rating: 643 }
                ],
                bowling: [
                    { rank: 1,  player: "Sophie Ecclestone",country: "England",     rating: 791 },
                    { rank: 2,  player: "Deepti Sharma",    country: "India",       rating: 768 },
                    { rank: 3,  player: "Megan Schutt",     country: "Australia",   rating: 742 },
                    { rank: 4,  player: "Shabnim Ismail",   country: "S. Africa",   rating: 726 },
                    { rank: 5,  player: "Ellyse Perry",     country: "Australia",   rating: 711 },
                    { rank: 6,  player: "Jhulan Goswami",   country: "India",       rating: 694 },
                    { rank: 7,  player: "Georgia Wareham",  country: "Australia",   rating: 679 },
                    { rank: 8,  player: "Lea Tahuhu",       country: "New Zealand", rating: 664 },
                    { rank: 9,  player: "Heather Knight",   country: "England",     rating: 648 },
                    { rank: 10, player: "Anisa Mohammed",   country: "West Indies", rating: 633 }
                ]
            }
        }
    },

    /**
     * Fantasy cricket tips for each upcoming CSK fixture.
     * Keyed by fixture ISO timestamp.
     * Each entry: { mustPick[], avoidList[], differentials[], captainPick, vcPick, summary }
     */
    fantasyTips: {
        "2026-03-30T14:00:00Z": {
            opponent: "Rajasthan Royals",
            mustPick:      ["Ruturaj Gaikwad (C)", "MS Dhoni", "Sanju Samson", "Shivam Dube", "Yashasvi Jaiswal"],
            differentials: ["Dewald Brevis", "Noor Ahmad", "Ayush Mhatre"],
            avoidList:     ["Khaleel Ahmed"],
            captainPick:   "Ruturaj Gaikwad (C)",
            vcPick:        "Shivam Dube",
            summary:       "Guwahati pitch has historically aided pacers early. Pick Gaikwad as captain — he has scored 3 consecutive 60+ at neutral venues. Dewald Brevis is a great differential at just 8–9% ownership."
        },
        "2026-04-03T14:00:00Z": {
            opponent: "Punjab Kings",
            mustPick:      ["Ruturaj Gaikwad (C)", "MS Dhoni", "Shivam Dube", "Noor Ahmad", "Khaleel Ahmed"],
            differentials: ["Ayush Mhatre", "Anshul Kamboj"],
            avoidList:     ["Matthew Short"],
            captainPick:   "Ruturaj Gaikwad (C)",
            vcPick:        "MS Dhoni",
            summary:       "Chepauk is a spin-friendly surface. Pick Noor Ahmad and Rahul Chahar. MS Dhoni thrives at home — great VC option."
        },
        "2026-04-05T10:00:00Z": {
            opponent: "Royal Challengers Bengaluru",
            mustPick:      ["Ruturaj Gaikwad (C)", "MS Dhoni", "Shivam Dube", "Dewald Brevis"],
            differentials: ["Matt Henry", "Jamie Overton"],
            avoidList:     ["Rahul Chahar"],
            captainPick:   "Shivam Dube",
            vcPick:        "Ruturaj Gaikwad (C)",
            summary:       "Chinnaswamy is a bat-friendly paradise. Pick power hitters — Dube as captain. Pacers will be expensive; target spinners for value."
        },
        "2026-04-14T14:00:00Z": {
            opponent: "Gujarat Titans",
            mustPick:      ["Ruturaj Gaikwad (C)", "MS Dhoni", "Shivam Dube", "Noor Ahmad"],
            differentials: ["Anshul Kamboj", "Jamie Overton"],
            avoidList:     ["Kartik Sharma"],
            captainPick:   "Ruturaj Gaikwad (C)",
            vcPick:        "Shivam Dube",
            summary:       "Narendra Modi Stadium has a big ground — pacers get more value here. Gaikwad is superb in away games vs GT. Pick Kamboj as a differential pacer at low ownership."
        },
        "2026-04-17T14:00:00Z": {
            opponent: "Sunrisers Hyderabad",
            mustPick:      ["Ruturaj Gaikwad (C)", "MS Dhoni", "Sanju Samson", "Shivam Dube", "Noor Ahmad"],
            differentials: ["Dewald Brevis", "Rahul Chahar"],
            avoidList:     [],
            captainPick:   "Ruturaj Gaikwad (C)",
            vcPick:        "Sanju Samson",
            summary:       "Home game at Chepauk — CSK's fortress. SRH love to play attacking cricket; expect a high-scoring game. Dhoni at No.5 is a must-pick in any format."
        },
        "2026-04-20T10:00:00Z": {
            opponent: "Mumbai Indians",
            mustPick:      ["Ruturaj Gaikwad (C)", "MS Dhoni", "Shivam Dube", "Matt Henry"],
            differentials: ["Dewald Brevis", "Nathan Ellis"],
            avoidList:     ["Urvil Patel"],
            captainPick:   "Shivam Dube",
            vcPick:        "Ruturaj Gaikwad (C)",
            summary:       "Wankhede is a flat belter — pick big hitters and powerplay bowlers. Dube as captain: he has a great record at Wankhede. Matt Henry gives you wickets in early overs."
        },
        "2026-04-26T14:00:00Z": {
            opponent: "Kolkata Knight Riders",
            mustPick:      ["Ruturaj Gaikwad (C)", "MS Dhoni", "Noor Ahmad", "Shivam Dube"],
            differentials: ["Akeal Hosein", "Jamie Overton"],
            avoidList:     [],
            captainPick:   "Ruturaj Gaikwad (C)",
            vcPick:        "MS Dhoni",
            summary:       "Home match vs KKR. CSK dominate this H2H (22-12). Chepauk spinners are invaluable — Noor Ahmad is a must. Pick Hosein as a spin differential."
        },
        "2026-04-29T14:00:00Z": {
            opponent: "Lucknow Super Giants",
            mustPick:      ["Ruturaj Gaikwad (C)", "MS Dhoni", "Shivam Dube", "Khaleel Ahmed"],
            differentials: ["Dewald Brevis", "Anshul Kamboj"],
            avoidList:     ["Prashant Veer"],
            captainPick:   "Ruturaj Gaikwad (C)",
            vcPick:        "Shivam Dube",
            summary:       "Ekana, Lucknow has a two-paced pitch that aids swing bowlers. Khaleel Ahmed is lethal here with the new ball. Pick Gaikwad as captain — consistent performer at all venues."
        },
        "2026-05-03T10:00:00Z": {
            opponent: "Rajasthan Royals",
            mustPick:      ["Ruturaj Gaikwad (C)", "MS Dhoni", "Sanju Samson", "Noor Ahmad", "Shivam Dube"],
            differentials: ["Ayush Mhatre", "Gurjapneet Singh"],
            avoidList:     [],
            captainPick:   "Sanju Samson",
            vcPick:        "Ruturaj Gaikwad (C)",
            summary:       "Back at Chepauk vs RR — expect spin to dominate. Sanju Samson as captain is a great differential pick given his form. Mhatre's aggression at the top suits this venue."
        },
        "2026-05-07T14:00:00Z": {
            opponent: "Punjab Kings",
            mustPick:      ["Ruturaj Gaikwad (C)", "MS Dhoni", "Shivam Dube", "Matt Henry"],
            differentials: ["Jamie Overton", "Ayush Mhatre"],
            avoidList:     ["Rahul Chahar"],
            captainPick:   "Ruturaj Gaikwad (C)",
            vcPick:        "Shivam Dube",
            summary:       "New PCA Stadium, Mullanpur plays very differently to Chepauk — flat and big. Pick hard-hitters and powerplay specialists. Gaikwad is in brilliant form and is a must-captain."
        },
        "2026-05-11T14:00:00Z": {
            opponent: "Delhi Capitals",
            mustPick:      ["Ruturaj Gaikwad (C)", "MS Dhoni", "Shivam Dube", "Khaleel Ahmed"],
            differentials: ["Noor Ahmad", "Dewald Brevis"],
            avoidList:     [],
            captainPick:   "Ruturaj Gaikwad (C)",
            vcPick:        "MS Dhoni",
            summary:       "Arun Jaitley, Delhi has a true surface. Spinners and pace both work. Pick Noor Ahmad for away advantage. Dhoni as VC remains evergreen in the death overs."
        },
        "2026-05-15T14:00:00Z": {
            opponent: "Gujarat Titans",
            mustPick:      ["Ruturaj Gaikwad (C)", "MS Dhoni", "Sanju Samson", "Noor Ahmad"],
            differentials: ["Anshul Kamboj", "Ayush Mhatre"],
            avoidList:     [],
            captainPick:   "Ruturaj Gaikwad (C)",
            vcPick:        "Sanju Samson",
            summary:       "Must-win territory in the final stages. Chepauk spin trio (Noor, Chahar, Hosein) could be decisive. Back Gaikwad heavily as captain — he scores big under pressure."
        },
        "2026-05-18T14:00:00Z": {
            opponent: "Sunrisers Hyderabad",
            mustPick:      ["Ruturaj Gaikwad (C)", "MS Dhoni", "Shivam Dube", "Noor Ahmad", "Khaleel Ahmed"],
            differentials: ["Dewald Brevis", "Matt Henry"],
            avoidList:     [],
            captainPick:   "Shivam Dube",
            vcPick:        "Ruturaj Gaikwad (C)",
            summary:       "Last league game — both teams fighting for playoffs. Rajiv Gandhi, Hyderabad is a high-scoring venue. Pick big hitters; Dube as captain could be decisive in the powerplay."
        }
    },

    /**
     * Static news / update entries — latest first.
     * Update this array to add new headlines throughout the season.
     */
    news: [
        {
            date: "MAR 2026",
            headline: "CSK kick off 2026 campaign away at Guwahati vs RR",
            body: "Chennai Super Kings open their IPL 2026 season against Rajasthan Royals at the Barsapara Cricket Stadium on March 30. The Lions will be looking to start strong away from home. Guwahati's wicket has historically been a batting surface, so expect a high-scoring encounter to open the season."
        },
        {
            date: "MAR 2026",
            headline: "Ruturaj Gaikwad confirmed as CSK captain for IPL 2026",
            body: "Ruturaj Gaikwad will lead the Yellow Army into a new season as captain of Chennai Super Kings, backed by a strong squad assembled at the IPL 2025 mega auction. The Maharashtra batter has scored over 900 runs in his last two IPL seasons and is widely regarded as one of the most consistent batters in the format."
        },
        {
            date: "MAR 2026",
            headline: "MS Dhoni to play IPL 2026 — confirms participation ahead of season",
            body: "CSK icon MS Dhoni has confirmed he will feature in IPL 2026, continuing his finisher role for Chennai. Dhoni hinted this could be his final season, making every match a must-watch. His presence gives CSK the most feared death-overs lineup in the tournament."
        },
        {
            date: "FEB 2026",
            headline: "CSK squad finalised — Sanju Samson joins the Yellow Army",
            body: "Chennai Super Kings secured Sanju Samson in the IPL mega auction, adding firepower behind the stumps alongside MS Dhoni. Dewald Brevis and Matt Henry also joined the squad, strengthening both batting depth and the pace attack. Noor Ahmad returns to continue his impressive partnership with Rahul Chahar in the spin department."
        },
        {
            date: "FEB 2026",
            headline: "Dewald Brevis — CSK's X-factor for IPL 2026",
            body: "South African prodigy Dewald Brevis, nicknamed 'Baby AB', is primed for a breakout IPL season with CSK. The aggressive batter averaged a strike rate of 165+ in recent franchise T20 cricket and is expected to bat at No.3 or No.4 for the Yellow Army."
        },
        {
            date: "JAN 2026",
            headline: "IPL 2026 schedule released — CSK host 7 home games at Chidambaram",
            body: "The BCCI released the IPL 2026 schedule, with Chennai Super Kings playing seven home matches at the MA Chidambaram Stadium. The season runs from March 22 to June 2026. CSK's first home game is on April 3 against Punjab Kings — an ideal opportunity to kick off the home campaign in front of the iconic yellow crowd."
        }
    ],

    /**
     * IPL 2026 fixtures — current 20-match release slate.
     * Used as a static fallback when no live API data is available.
     * isCSK: true marks Chennai Super Kings matches (highlighted in the UI).
     * d: "DD MMM"  t: "H:MM PM"  iso: UTC datetime  v: short venue name
     */
    iplSchedule: [
        { d:"28 MAR", t:"7:30 PM", team1:"Royal Challengers Bengaluru", team1Short:"RCB", team2:"Sunrisers Hyderabad", team2Short:"SRH", v:"Bengaluru", iso:"2026-03-28T14:00:00Z", isCSK:false },
        { d:"29 MAR", t:"3:30 PM", team1:"Rajasthan Royals", team1Short:"RR", team2:"Mumbai Indians", team2Short:"MI", v:"Jaipur", iso:"2026-03-29T10:00:00Z", isCSK:false },
        { d:"29 MAR", t:"7:30 PM", team1:"Kolkata Knight Riders", team1Short:"KKR", team2:"Lucknow Super Giants", team2Short:"LSG", v:"Kolkata", iso:"2026-03-29T14:00:00Z", isCSK:false },
        { d:"30 MAR", t:"7:30 PM", team1:"Rajasthan Royals", team1Short:"RR", team2:"Chennai Super Kings", team2Short:"CSK", v:"Guwahati", iso:"2026-03-30T14:00:00Z", isCSK:true },
        { d:"31 MAR", t:"7:30 PM", team1:"Punjab Kings", team1Short:"PBKS", team2:"Gujarat Titans", team2Short:"GT", v:"Mullanpur / New Chandigarh", iso:"2026-03-31T14:00:00Z", isCSK:false },
        { d:"01 APR", t:"3:30 PM", team1:"Mumbai Indians", team1Short:"MI", team2:"Sunrisers Hyderabad", team2Short:"SRH", v:"Mumbai", iso:"2026-04-01T10:00:00Z", isCSK:false },
        { d:"01 APR", t:"7:30 PM", team1:"Lucknow Super Giants", team1Short:"LSG", team2:"Delhi Capitals", team2Short:"DC", v:"Lucknow", iso:"2026-04-01T14:00:00Z", isCSK:false },
        { d:"02 APR", t:"7:30 PM", team1:"Kolkata Knight Riders", team1Short:"KKR", team2:"Royal Challengers Bengaluru", team2Short:"RCB", v:"Kolkata", iso:"2026-04-02T14:00:00Z", isCSK:false },
        { d:"03 APR", t:"7:30 PM", team1:"Chennai Super Kings", team1Short:"CSK", team2:"Punjab Kings", team2Short:"PBKS", v:"Chennai", iso:"2026-04-03T14:00:00Z", isCSK:true },
        { d:"04 APR", t:"3:30 PM", team1:"Delhi Capitals", team1Short:"DC", team2:"Mumbai Indians", team2Short:"MI", v:"Delhi", iso:"2026-04-04T10:00:00Z", isCSK:false },
        { d:"04 APR", t:"7:30 PM", team1:"Gujarat Titans", team1Short:"GT", team2:"Rajasthan Royals", team2Short:"RR", v:"Ahmedabad", iso:"2026-04-04T14:00:00Z", isCSK:false },
        { d:"05 APR", t:"3:30 PM", team1:"Sunrisers Hyderabad", team1Short:"SRH", team2:"Lucknow Super Giants", team2Short:"LSG", v:"Hyderabad", iso:"2026-04-05T10:00:00Z", isCSK:false },
        { d:"05 APR", t:"7:30 PM", team1:"Royal Challengers Bengaluru", team1Short:"RCB", team2:"Chennai Super Kings", team2Short:"CSK", v:"Bengaluru", iso:"2026-04-05T14:00:00Z", isCSK:true },
        { d:"06 APR", t:"7:30 PM", team1:"Kolkata Knight Riders", team1Short:"KKR", team2:"Punjab Kings", team2Short:"PBKS", v:"Kolkata", iso:"2026-04-06T14:00:00Z", isCSK:false },
        { d:"07 APR", t:"3:30 PM", team1:"Mumbai Indians", team1Short:"MI", team2:"Punjab Kings", team2Short:"PBKS", v:"Mumbai", iso:"2026-04-07T10:00:00Z", isCSK:false },
        { d:"07 APR", t:"7:30 PM", team1:"Rajasthan Royals", team1Short:"RR", team2:"Kolkata Knight Riders", team2Short:"KKR", v:"Jaipur", iso:"2026-04-07T14:00:00Z", isCSK:false },
        { d:"08 APR", t:"3:30 PM", team1:"Delhi Capitals", team1Short:"DC", team2:"Gujarat Titans", team2Short:"GT", v:"Delhi", iso:"2026-04-08T10:00:00Z", isCSK:false },
        { d:"08 APR", t:"7:30 PM", team1:"Punjab Kings", team1Short:"PBKS", team2:"Sunrisers Hyderabad", team2Short:"SRH", v:"Mullanpur / New Chandigarh", iso:"2026-04-08T14:00:00Z", isCSK:false },
        { d:"09 APR", t:"3:30 PM", team1:"Kolkata Knight Riders", team1Short:"KKR", team2:"Lucknow Super Giants", team2Short:"LSG", v:"Kolkata", iso:"2026-04-09T10:00:00Z", isCSK:false },
        { d:"09 APR", t:"7:30 PM", team1:"Royal Challengers Bengaluru", team1Short:"RCB", team2:"Rajasthan Royals", team2Short:"RR", v:"Bengaluru", iso:"2026-04-09T14:00:00Z", isCSK:false },
        { d:"10 APR", t:"3:30 PM", team1:"Kolkata Knight Riders", team1Short:"KKR", team2:"Mumbai Indians", team2Short:"MI", v:"Kolkata", iso:"2026-04-10T10:00:00Z", isCSK:false },
        { d:"10 APR", t:"7:30 PM", team1:"Rajasthan Royals", team1Short:"RR", team2:"Royal Challengers Bengaluru", team2Short:"RCB", v:"Guwahati", iso:"2026-04-10T14:00:00Z", isCSK:false },
        { d:"11 APR", t:"3:30 PM", team1:"Punjab Kings", team1Short:"PBKS", team2:"Sunrisers Hyderabad", team2Short:"SRH", v:"Mullanpur / New Chandigarh", iso:"2026-04-11T10:00:00Z", isCSK:false },
        { d:"11 APR", t:"7:30 PM", team1:"Chennai Super Kings", team1Short:"CSK", team2:"Delhi Capitals", team2Short:"DC", v:"Chennai", iso:"2026-04-11T14:00:00Z", isCSK:true },
        { d:"12 APR", t:"3:30 PM", team1:"Lucknow Super Giants", team1Short:"LSG", team2:"Gujarat Titans", team2Short:"GT", v:"Lucknow", iso:"2026-04-12T10:00:00Z", isCSK:false },
        { d:"13 APR", t:"7:30 PM", team1:"Sunrisers Hyderabad", team1Short:"SRH", team2:"Rajasthan Royals", team2Short:"RR", v:"Hyderabad", iso:"2026-04-13T14:00:00Z", isCSK:false },
        { d:"14 APR", t:"3:30 PM", team1:"Mumbai Indians", team1Short:"MI", team2:"Royal Challengers Bengaluru", team2Short:"RCB", v:"Mumbai", iso:"2026-04-14T10:00:00Z", isCSK:false },
        { d:"14 APR", t:"7:30 PM", team1:"Chennai Super Kings", team1Short:"CSK", team2:"Kolkata Knight Riders", team2Short:"KKR", v:"Chennai", iso:"2026-04-14T14:00:00Z", isCSK:true },
        { d:"15 APR", t:"7:30 PM", team1:"Royal Challengers Bengaluru", team1Short:"RCB", team2:"Lucknow Super Giants", team2Short:"LSG", v:"Bengaluru", iso:"2026-04-15T14:00:00Z", isCSK:false },
        { d:"16 APR", t:"7:30 PM", team1:"Mumbai Indians", team1Short:"MI", team2:"Punjab Kings", team2Short:"PBKS", v:"Mumbai", iso:"2026-04-16T14:00:00Z", isCSK:false },
        { d:"17 APR", t:"7:30 PM", team1:"Gujarat Titans", team1Short:"GT", team2:"Kolkata Knight Riders", team2Short:"KKR", v:"Ahmedabad", iso:"2026-04-17T14:00:00Z", isCSK:false },
        { d:"18 APR", t:"3:30 PM", team1:"Royal Challengers Bengaluru", team1Short:"RCB", team2:"Delhi Capitals", team2Short:"DC", v:"Bengaluru", iso:"2026-04-18T10:00:00Z", isCSK:false },
        { d:"18 APR", t:"7:30 PM", team1:"Sunrisers Hyderabad", team1Short:"SRH", team2:"Chennai Super Kings", team2Short:"CSK", v:"Hyderabad", iso:"2026-04-18T14:00:00Z", isCSK:true },
        { d:"19 APR", t:"3:30 PM", team1:"Kolkata Knight Riders", team1Short:"KKR", team2:"Rajasthan Royals", team2Short:"RR", v:"Kolkata", iso:"2026-04-19T10:00:00Z", isCSK:false },
        { d:"19 APR", t:"7:30 PM", team1:"Punjab Kings", team1Short:"PBKS", team2:"Lucknow Super Giants", team2Short:"LSG", v:"Mullanpur / New Chandigarh", iso:"2026-04-19T14:00:00Z", isCSK:false },
        { d:"20 APR", t:"7:30 PM", team1:"Gujarat Titans", team1Short:"GT", team2:"Mumbai Indians", team2Short:"MI", v:"Ahmedabad", iso:"2026-04-20T14:00:00Z", isCSK:false },
        { d:"21 APR", t:"3:30 PM", team1:"Sunrisers Hyderabad", team1Short:"SRH", team2:"Delhi Capitals", team2Short:"DC", v:"Hyderabad", iso:"2026-04-21T10:00:00Z", isCSK:false },
        { d:"21 APR", t:"7:30 PM", team1:"Royal Challengers Bengaluru", team1Short:"RCB", team2:"Gujarat Titans", team2Short:"GT", v:"Bengaluru", iso:"2026-04-21T14:00:00Z", isCSK:false },
        { d:"22 APR", t:"7:30 PM", team1:"Lucknow Super Giants", team1Short:"LSG", team2:"Rajasthan Royals", team2Short:"RR", v:"Lucknow", iso:"2026-04-22T14:00:00Z", isCSK:false },
        { d:"23 APR", t:"7:30 PM", team1:"Mumbai Indians", team1Short:"MI", team2:"Chennai Super Kings", team2Short:"CSK", v:"Mumbai", iso:"2026-04-23T14:00:00Z", isCSK:true },
        { d:"24 APR", t:"7:30 PM", team1:"Royal Challengers Bengaluru", team1Short:"RCB", team2:"Lucknow Super Giants", team2Short:"LSG", v:"Raipur", iso:"2026-04-24T14:00:00Z", isCSK:false },
        { d:"25 APR", t:"3:30 PM", team1:"Delhi Capitals", team1Short:"DC", team2:"Punjab Kings", team2Short:"PBKS", v:"Delhi", iso:"2026-04-25T10:00:00Z", isCSK:false },
        { d:"25 APR", t:"7:30 PM", team1:"Rajasthan Royals", team1Short:"RR", team2:"Sunrisers Hyderabad", team2Short:"SRH", v:"Jaipur", iso:"2026-04-25T14:00:00Z", isCSK:false },
        { d:"26 APR", t:"3:30 PM", team1:"Gujarat Titans", team1Short:"GT", team2:"Chennai Super Kings", team2Short:"CSK", v:"Ahmedabad", iso:"2026-04-26T10:00:00Z", isCSK:true },
        { d:"26 APR", t:"7:30 PM", team1:"Kolkata Knight Riders", team1Short:"KKR", team2:"Sunrisers Hyderabad", team2Short:"SRH", v:"Kolkata", iso:"2026-04-26T14:00:00Z", isCSK:false },
        { d:"27 APR", t:"7:30 PM", team1:"Delhi Capitals", team1Short:"DC", team2:"Royal Challengers Bengaluru", team2Short:"RCB", v:"Delhi", iso:"2026-04-27T14:00:00Z", isCSK:false },
        { d:"28 APR", t:"7:30 PM", team1:"Punjab Kings", team1Short:"PBKS", team2:"Rajasthan Royals", team2Short:"RR", v:"Mullanpur / New Chandigarh", iso:"2026-04-28T14:00:00Z", isCSK:false },
        { d:"29 APR", t:"7:30 PM", team1:"Mumbai Indians", team1Short:"MI", team2:"Kolkata Knight Riders", team2Short:"KKR", v:"Mumbai", iso:"2026-04-29T14:00:00Z", isCSK:false },
        { d:"30 APR", t:"7:30 PM", team1:"Gujarat Titans", team1Short:"GT", team2:"Royal Challengers Bengaluru", team2Short:"RCB", v:"Ahmedabad", iso:"2026-04-30T14:00:00Z", isCSK:false },
        { d:"01 MAY", t:"7:30 PM", team1:"Rajasthan Royals", team1Short:"RR", team2:"Delhi Capitals", team2Short:"DC", v:"Jaipur", iso:"2026-05-01T14:00:00Z", isCSK:false },
        { d:"02 MAY", t:"7:30 PM", team1:"Chennai Super Kings", team1Short:"CSK", team2:"Mumbai Indians", team2Short:"MI", v:"Chennai", iso:"2026-05-02T14:00:00Z", isCSK:true },
        { d:"03 MAY", t:"3:30 PM", team1:"Gujarat Titans", team1Short:"GT", team2:"Punjab Kings", team2Short:"PBKS", v:"Ahmedabad", iso:"2026-05-03T10:00:00Z", isCSK:false },
        { d:"03 MAY", t:"7:30 PM", team1:"Rajasthan Royals", team1Short:"RR", team2:"Sunrisers Hyderabad", team2Short:"SRH", v:"Jaipur", iso:"2026-05-03T14:00:00Z", isCSK:false },
        { d:"04 MAY", t:"3:30 PM", team1:"Royal Challengers Bengaluru", team1Short:"RCB", team2:"Mumbai Indians", team2Short:"MI", v:"Raipur", iso:"2026-05-04T10:00:00Z", isCSK:false },
        { d:"04 MAY", t:"7:30 PM", team1:"Punjab Kings", team1Short:"PBKS", team2:"Kolkata Knight Riders", team2Short:"KKR", v:"Dharamsala", iso:"2026-05-04T14:00:00Z", isCSK:false },
        { d:"05 MAY", t:"7:30 PM", team1:"Delhi Capitals", team1Short:"DC", team2:"Chennai Super Kings", team2Short:"CSK", v:"Delhi", iso:"2026-05-05T14:00:00Z", isCSK:true },
        { d:"06 MAY", t:"7:30 PM", team1:"Sunrisers Hyderabad", team1Short:"SRH", team2:"Punjab Kings", team2Short:"PBKS", v:"Hyderabad", iso:"2026-05-06T14:00:00Z", isCSK:false },
        { d:"07 MAY", t:"7:30 PM", team1:"Lucknow Super Giants", team1Short:"LSG", team2:"Royal Challengers Bengaluru", team2Short:"RCB", v:"Lucknow", iso:"2026-05-07T14:00:00Z", isCSK:false },
        { d:"08 MAY", t:"3:30 PM", team1:"Delhi Capitals", team1Short:"DC", team2:"Kolkata Knight Riders", team2Short:"KKR", v:"Delhi", iso:"2026-05-08T10:00:00Z", isCSK:false },
        { d:"08 MAY", t:"7:30 PM", team1:"Sunrisers Hyderabad", team1Short:"SRH", team2:"Mumbai Indians", team2Short:"MI", v:"Hyderabad", iso:"2026-05-08T14:00:00Z", isCSK:false },
        { d:"09 MAY", t:"7:30 PM", team1:"Rajasthan Royals", team1Short:"RR", team2:"Gujarat Titans", team2Short:"GT", v:"Jaipur", iso:"2026-05-09T14:00:00Z", isCSK:false },
        { d:"10 MAY", t:"3:30 PM", team1:"Chennai Super Kings", team1Short:"CSK", team2:"Lucknow Super Giants", team2Short:"LSG", v:"Chennai", iso:"2026-05-10T10:00:00Z", isCSK:true },
        { d:"11 MAY", t:"7:30 PM", team1:"Punjab Kings", team1Short:"PBKS", team2:"Delhi Capitals", team2Short:"DC", v:"Dharamsala", iso:"2026-05-11T14:00:00Z", isCSK:false },
        { d:"12 MAY", t:"3:30 PM", team1:"Royal Challengers Bengaluru", team1Short:"RCB", team2:"Punjab Kings", team2Short:"PBKS", v:"Raipur", iso:"2026-05-12T10:00:00Z", isCSK:false },
        { d:"12 MAY", t:"7:30 PM", team1:"Gujarat Titans", team1Short:"GT", team2:"Sunrisers Hyderabad", team2Short:"SRH", v:"Ahmedabad", iso:"2026-05-12T14:00:00Z", isCSK:false },
        { d:"13 MAY", t:"3:30 PM", team1:"Mumbai Indians", team1Short:"MI", team2:"Gujarat Titans", team2Short:"GT", v:"Mumbai", iso:"2026-05-13T10:00:00Z", isCSK:false },
        { d:"13 MAY", t:"7:30 PM", team1:"Kolkata Knight Riders", team1Short:"KKR", team2:"Punjab Kings", team2Short:"PBKS", v:"Kolkata", iso:"2026-05-13T14:00:00Z", isCSK:false },
        { d:"14 MAY", t:"7:30 PM", team1:"Punjab Kings", team1Short:"PBKS", team2:"Mumbai Indians", team2Short:"MI", v:"Dharamsala", iso:"2026-05-14T14:00:00Z", isCSK:false },
        { d:"15 MAY", t:"7:30 PM", team1:"Lucknow Super Giants", team1Short:"LSG", team2:"Chennai Super Kings", team2Short:"CSK", v:"Lucknow", iso:"2026-05-15T14:00:00Z", isCSK:true },
        { d:"16 MAY", t:"7:30 PM", team1:"Kolkata Knight Riders", team1Short:"KKR", team2:"Gujarat Titans", team2Short:"GT", v:"Kolkata", iso:"2026-05-16T14:00:00Z", isCSK:false },
        { d:"17 MAY", t:"3:30 PM", team1:"Punjab Kings", team1Short:"PBKS", team2:"Royal Challengers Bengaluru", team2Short:"RCB", v:"Dharamsala", iso:"2026-05-17T10:00:00Z", isCSK:false },
        { d:"17 MAY", t:"7:30 PM", team1:"Delhi Capitals", team1Short:"DC", team2:"Rajasthan Royals", team2Short:"RR", v:"Delhi", iso:"2026-05-17T14:00:00Z", isCSK:false },
        { d:"18 MAY", t:"7:30 PM", team1:"Chennai Super Kings", team1Short:"CSK", team2:"Sunrisers Hyderabad", team2Short:"SRH", v:"Chennai", iso:"2026-05-18T14:00:00Z", isCSK:true },
        { d:"19 MAY", t:"7:30 PM", team1:"Rajasthan Royals", team1Short:"RR", team2:"Lucknow Super Giants", team2Short:"LSG", v:"Jaipur", iso:"2026-05-19T14:00:00Z", isCSK:false },
        { d:"21 MAY", t:"7:30 PM", team1:"Chennai Super Kings", team1Short:"CSK", team2:"Gujarat Titans", team2Short:"GT", v:"Chennai", iso:"2026-05-21T14:00:00Z", isCSK:true },
        { d:"22 MAY", t:"7:30 PM", team1:"Royal Challengers Bengaluru", team1Short:"RCB", team2:"Mumbai Indians", team2Short:"MI", v:"Raipur", iso:"2026-05-22T14:00:00Z", isCSK:false },
        { d:"23 MAY", t:"7:30 PM", team1:"Lucknow Super Giants", team1Short:"LSG", team2:"Punjab Kings", team2Short:"PBKS", v:"Lucknow", iso:"2026-05-23T14:00:00Z", isCSK:false },
        { d:"24 MAY", t:"3:30 PM", team1:"Mumbai Indians", team1Short:"MI", team2:"Rajasthan Royals", team2Short:"RR", v:"Mumbai", iso:"2026-05-24T10:00:00Z", isCSK:false },
        { d:"24 MAY", t:"7:30 PM", team1:"Kolkata Knight Riders", team1Short:"KKR", team2:"Delhi Capitals", team2Short:"DC", v:"Kolkata", iso:"2026-05-24T14:00:00Z", isCSK:false }
    ]
};
