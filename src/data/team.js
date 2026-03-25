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
        pitch: "Expected to be a batting-friendly surface",
        weather: "Partly cloudy, ~28 °C"
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
        "Ruturaj Gaikwad (C)": { nat: "IND", flag: "🇮🇳", role: "Top order",       jersey: 31, age: 27, bat: "Right-hand",  bowl: "Right-arm off-break",     vc: false },
        "Sarfaraz Khan":        { nat: "IND", flag: "🇮🇳", role: "Middle order",    jersey: 45, age: 27, bat: "Right-hand",  bowl: "Right-arm off-break",     vc: false },
        "Dewald Brevis":        { nat: "RSA", flag: "🇿🇦", role: "Top order",       jersey: 52, age: 21, bat: "Right-hand",  bowl: "Right-arm off-break",     vc: false },
        "Ayush Mhatre":         { nat: "IND", flag: "🇮🇳", role: "Top order",       jersey: 83, age: 18, bat: "Right-hand",  bowl: "Right-arm medium",        vc: false },
        "MS Dhoni":             { nat: "IND", flag: "🇮🇳", role: "Wicket-keeper",   jersey:  7, age: 44, bat: "Right-hand",  bowl: "Right-arm medium",        vc: false },
        "Sanju Samson":         { nat: "IND", flag: "🇮🇳", role: "Wicket-keeper",   jersey:  8, age: 31, bat: "Right-hand",  bowl: "Right-arm off-break",     vc: false },
        "Urvil Patel":          { nat: "IND", flag: "🇮🇳", role: "Wicket-keeper",   jersey: 95, age: 23, bat: "Right-hand",  bowl: "Right-arm off-break",     vc: false },
        "Kartik Sharma":        { nat: "IND", flag: "🇮🇳", role: "Wicket-keeper",   jersey: 62, age: 21, bat: "Right-hand",  bowl: "Right-arm off-break",     vc: false },
        "Shivam Dube":          { nat: "IND", flag: "🇮🇳", role: "Finisher",        jersey: 21, age: 31, bat: "Left-hand",   bowl: "Right-arm medium-fast",   vc: true  },
        "Jamie Overton":        { nat: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", role: "All-rounder",    jersey: 14, age: 29, bat: "Right-hand",  bowl: "Right-arm fast-medium",   vc: false },
        "Matthew Short":        { nat: "AUS", flag: "🇦🇺", role: "All-rounder",     jersey: 59, age: 27, bat: "Right-hand",  bowl: "Right-arm off-break",     vc: false },
        "Aman Hakim Khan":      { nat: "IND", flag: "🇮🇳", role: "All-rounder",     jersey: 77, age: 22, bat: "Right-hand",  bowl: "Right-arm medium",        vc: false },
        "Prashant Veer":        { nat: "IND", flag: "🇮🇳", role: "All-rounder",     jersey: 66, age: 22, bat: "Right-hand",  bowl: "Right-arm medium-fast",   vc: false },
        "R. Ghosh":             { nat: "IND", flag: "🇮🇳", role: "All-rounder",     jersey: 48, age: 20, bat: "Left-hand",   bowl: "Left-arm orthodox",       vc: false },
        "Zakary Foulkes":       { nat: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", role: "Pace",          jersey: 88, age: 22, bat: "Right-hand",  bowl: "Right-arm fast-medium",   vc: false },
        "Khaleel Ahmed":        { nat: "IND", flag: "🇮🇳", role: "Pace",            jersey: 10, age: 27, bat: "Left-hand",   bowl: "Left-arm fast-medium",    vc: false },
        "M. Choudhary":         { nat: "IND", flag: "🇮🇳", role: "Pace",            jersey: 23, age: 29, bat: "Right-hand",  bowl: "Right-arm fast-medium",   vc: false },
        "Nathan Ellis":         { nat: "AUS", flag: "🇦🇺", role: "Pace",            jersey: 35, age: 29, bat: "Right-hand",  bowl: "Right-arm fast-medium",   vc: false },
        "Matt Henry":           { nat: "NZ",  flag: "🇳🇿", role: "Pace",            jersey: 29, age: 32, bat: "Right-hand",  bowl: "Right-arm fast-medium",   vc: false },
        "Anshul Kamboj":        { nat: "IND", flag: "🇮🇳", role: "Pace",            jersey: 71, age: 22, bat: "Right-hand",  bowl: "Right-arm fast-medium",   vc: false },
        "Gurjapneet Singh":     { nat: "IND", flag: "🇮🇳", role: "Pace",            jersey: 90, age: 24, bat: "Right-hand",  bowl: "Right-arm fast-medium",   vc: false },
        "Noor Ahmad":           { nat: "AFG", flag: "🇦🇫", role: "Spin",            jersey: 18, age: 20, bat: "Right-hand",  bowl: "Left-arm wrist spin",     vc: false },
        "Rahul Chahar":         { nat: "IND", flag: "🇮🇳", role: "Spin",            jersey: 40, age: 25, bat: "Right-hand",  bowl: "Right-arm leg-break",     vc: false },
        "Akeal Hosein":         { nat: "WIN", flag: "🇹🇹", role: "Spin",            jersey: 55, age: 30, bat: "Left-hand",   bowl: "Left-arm orthodox",       vc: false },
        "Shreyas Gopal":        { nat: "IND", flag: "🇮🇳", role: "Spin",            jersey: 16, age: 31, bat: "Right-hand",  bowl: "Right-arm leg-break",     vc: false }
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
     * IPL 2026 venue geocoordinates — used for the interactive map and weather overlay.
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
     * Head-to-head historical records vs each CSK opponent.
     * w: overall wins, l: overall losses, last5: five most recent results (newest first).
     */
    h2h: {
        "Rajasthan Royals":            { w: 18, l: 15, last5: ['W','L','W','W','L'] },
        "Punjab Kings":                { w: 20, l: 12, last5: ['W','W','L','W','W'] },
        "Royal Challengers Bengaluru": { w: 21, l: 13, last5: ['L','W','W','L','W'] },
        "Delhi Capitals":              { w: 19, l: 11, last5: ['W','W','W','L','W'] },
        "Gujarat Titans":              { w:  4, l:  2, last5: ['W','L','W','W','L'] },
        "Sunrisers Hyderabad":         { w: 14, l: 11, last5: ['L','W','L','W','W'] },
        "Mumbai Indians":              { w: 17, l: 19, last5: ['L','W','L','L','W'] },
        "Kolkata Knight Riders":       { w: 18, l: 16, last5: ['W','L','L','W','W'] },
        "Lucknow Super Giants":        { w:  3, l:  4, last5: ['L','W','L','W','L'] }
    },

    /**
     * Probable Playing XIs — keyed by fixture ISO timestamp.
     * Update this object closer to each match day.
     */
    probableXIs: {
        "2026-03-30T14:00:00Z": {
            csk: [
                "Ruturaj Gaikwad (C)", "Ayush Mhatre", "Dewald Brevis",
                "Sanju Samson (wk)", "Shivam Dube (vc)", "MS Dhoni",
                "Matthew Short", "Noor Ahmad", "Khaleel Ahmed",
                "Matt Henry", "Anshul Kamboj"
            ],
            opp: [
                "Yashasvi Jaiswal", "Vaibhav Suryavanshi", "Sanju Samson (C/wk)",
                "Riyan Parag", "Shimron Hetmyer", "Dhruv Jurel",
                "Nitish Rana", "Maheesh Theekshana", "Yuzvendra Chahal",
                "Trent Boult", "Sandeep Sharma"
            ]
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
            body: "Chennai Super Kings open their IPL 2026 season against Rajasthan Royals at the Barsapara Cricket Stadium on March 30. The Lions will be looking to start strong away from home."
        },
        {
            date: "MAR 2026",
            headline: "Ruturaj Gaikwad confirmed as CSK captain for IPL 2026",
            body: "Ruturaj Gaikwad will lead the Yellow Army into a new season as captain of Chennai Super Kings, backed by a strong squad assembled at the IPL 2025 mega auction."
        },
        {
            date: "FEB 2026",
            headline: "CSK squad finalised — Sanju Samson joins the Yellow Army",
            body: "Chennai Super Kings secured Sanju Samson in the IPL mega auction, adding firepower behind the stumps alongside MS Dhoni. Dewald Brevis and Matt Henry also joined the squad."
        },
        {
            date: "JAN 2026",
            headline: "IPL 2026 schedule released — CSK host 7 home games at Chidambaram",
            body: "The BCCI released the IPL 2026 schedule, with Chennai Super Kings playing seven home matches at the MA Chidambaram Stadium. The season runs from March 22 to June 2026."
        }
    ]
};
