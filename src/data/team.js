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

    /**
     * Full fixture list
     * d: display date   t: display time (IST)   o: opponent   v: venue   b: broadcast
     * iso: ISO-8601 match start in IST (UTC+5:30) used for auto-detecting the next match
     */
    fixtures: [
        { d: "30 MAR", t: "7:30 PM",  o: "Rajasthan Royals",           v: "Barsapara, Guwahati",        b: "Star Sports / JioCinema", iso: "2026-03-30T14:00:00Z" },
        { d: "03 APR", t: "7:30 PM",  o: "Punjab Kings",                v: "Chidambaram, Chennai",       b: "Star Sports / JioCinema", iso: "2026-04-03T14:00:00Z" },
        { d: "05 APR", t: "3:30 PM",  o: "Royal Challengers Bengaluru", v: "Chinnaswamy, Bengaluru",     b: "Star Sports / JioCinema", iso: "2026-04-05T10:00:00Z" },
        { d: "11 APR", t: "7:30 PM",  o: "Delhi Capitals",              v: "Chidambaram, Chennai",       b: "Star Sports / JioCinema", iso: "2026-04-11T14:00:00Z" },
        { d: "14 APR", t: "7:30 PM",  o: "Gujarat Titans",              v: "Narendra Modi, Ahmedabad",   b: "Star Sports / JioCinema", iso: "2026-04-14T14:00:00Z" },
        { d: "17 APR", t: "7:30 PM",  o: "Sunrisers Hyderabad",         v: "Chidambaram, Chennai",       b: "Star Sports / JioCinema", iso: "2026-04-17T14:00:00Z" },
        { d: "20 APR", t: "3:30 PM",  o: "Mumbai Indians",              v: "Wankhede, Mumbai",           b: "Star Sports / JioCinema", iso: "2026-04-20T10:00:00Z" },
        { d: "26 APR", t: "7:30 PM",  o: "Kolkata Knight Riders",       v: "Chidambaram, Chennai",       b: "Star Sports / JioCinema", iso: "2026-04-26T14:00:00Z" },
        { d: "29 APR", t: "7:30 PM",  o: "Lucknow Super Giants",        v: "Ekana, Lucknow",             b: "Star Sports / JioCinema", iso: "2026-04-29T14:00:00Z" },
        { d: "03 MAY", t: "3:30 PM",  o: "Rajasthan Royals",            v: "Chidambaram, Chennai",       b: "Star Sports / JioCinema", iso: "2026-05-03T10:00:00Z" },
        { d: "07 MAY", t: "7:30 PM",  o: "Punjab Kings",                v: "New PCA, Mullanpur",         b: "Star Sports / JioCinema", iso: "2026-05-07T14:00:00Z" },
        { d: "11 MAY", t: "7:30 PM",  o: "Delhi Capitals",              v: "Arun Jaitley, Delhi",        b: "Star Sports / JioCinema", iso: "2026-05-11T14:00:00Z" },
        { d: "15 MAY", t: "7:30 PM",  o: "Gujarat Titans",              v: "Chidambaram, Chennai",       b: "Star Sports / JioCinema", iso: "2026-05-15T14:00:00Z" },
        { d: "18 MAY", t: "7:30 PM",  o: "Sunrisers Hyderabad",         v: "Rajiv Gandhi, Hyderabad",    b: "Star Sports / JioCinema", iso: "2026-05-18T14:00:00Z" }
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
     */
    playerDetails: {
        "Ruturaj Gaikwad (C)": { nat: "IND" },
        "Sarfaraz Khan":        { nat: "IND" },
        "Dewald Brevis":        { nat: "RSA" },
        "Ayush Mhatre":         { nat: "IND" },
        "MS Dhoni":             { nat: "IND" },
        "Sanju Samson":         { nat: "IND" },
        "Urvil Patel":          { nat: "IND" },
        "Kartik Sharma":        { nat: "IND" },
        "Shivam Dube":          { nat: "IND" },
        "Jamie Overton":        { nat: "ENG" },
        "Matthew Short":        { nat: "AUS" },
        "Aman Hakim Khan":      { nat: "IND" },
        "Prashant Veer":        { nat: "IND" },
        "R. Ghosh":             { nat: "IND" },
        "Zakary Foulkes":       { nat: "ENG" },
        "Khaleel Ahmed":        { nat: "IND" },
        "M. Choudhary":         { nat: "IND" },
        "Nathan Ellis":         { nat: "AUS" },
        "Matt Henry":           { nat: "NZ"  },
        "Anshul Kamboj":        { nat: "IND" },
        "Gurjapneet Singh":     { nat: "IND" },
        "Noor Ahmad":           { nat: "AFG" },
        "Rahul Chahar":         { nat: "IND" },
        "Akeal Hosein":         { nat: "WIN" },
        "Shreyas Gopal":        { nat: "IND" }
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
    }
};
