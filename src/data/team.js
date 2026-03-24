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

    /** Match centre: live scorecard, ball-by-ball, wagon wheel */
    matchCentre: {
        live: true,
        match: "CSK vs RR",
        venue: "MA Chidambaram, Chennai",
        innings: 1,
        batting: { team: "CSK", runs: 156, wickets: 4, overs: "15.3", crr: "10.06" },
        target: null,

        /** Batters currently at the crease */
        batters: [
            { name: "Ruturaj Gaikwad*", runs: 67, balls: 48, fours: 7, sixes: 2 },
            { name: "Shivam Dube",      runs: 34, balls: 22, fours: 2, sixes: 3 }
        ],

        /** Dismissed batters (most recent dismissal first) */
        scorecard: [
            { name: "MS Dhoni",      runs: 18, balls: 12, fours: 1, sixes: 1, how: "c Samson b Chahal"  },
            { name: "Dewald Brevis", runs: 21, balls: 15, fours: 3, sixes: 0, how: "b Sandeep"           },
            { name: "Sarfaraz Khan", runs: 12, balls: 9,  fours: 1, sixes: 0, how: "lbw Chahal"          },
            { name: "Ayush Mhatre",  runs:  4, balls: 6,  fours: 0, sixes: 0, how: "c Powell b Parag"    }
        ],

        /** Bowling figures (current spell) */
        bowling: [
            { name: "Y. Chahal",  o: "4",   r: 32, w: 2, econ: "8.00"  },
            { name: "Sandeep S.", o: "3",   r: 28, w: 1, econ: "9.33"  },
            { name: "R. Parag",   o: "2",   r: 18, w: 1, econ: "9.00"  },
            { name: "T. Boult",   o: "3.3", r: 35, w: 0, econ: "10.00" }
        ],

        /**
         * Ball-by-ball log — most-recent delivery first.
         * type: "boundary" | "six" | "wicket" | "run" | "dot"
         */
        ballByBall: [
            { over: "15", ball: "3", runs:   4, type: "boundary", desc: "Gaikwad drives through covers"              },
            { over: "15", ball: "2", runs:   1, type: "run",      desc: "Dube works to mid-on"                       },
            { over: "15", ball: "1", runs:   6, type: "six",      desc: "Dube launches over long-on"                 },
            { over: "14", ball: "6", runs:   0, type: "dot",      desc: "Boult beats the outside edge"               },
            { over: "14", ball: "5", runs:   2, type: "run",      desc: "Gaikwad sweeps to fine leg"                 },
            { over: "14", ball: "4", runs:   1, type: "run",      desc: "Dube tucks to square leg"                   },
            { over: "14", ball: "3", runs:   4, type: "boundary", desc: "Gaikwad cuts hard through point"            },
            { over: "14", ball: "2", runs:   0, type: "dot",      desc: "Boult hits the pads, loud appeal"           },
            { over: "14", ball: "1", runs:   6, type: "six",      desc: "Dube smashes over mid-wicket"               },
            { over: "13", ball: "6", runs:   1, type: "run",      desc: "Gaikwad works to mid-wicket"                },
            { over: "13", ball: "5", runs:   0, type: "wicket",   desc: "Parag takes a stunning catch at long-off!"  },
            { over: "13", ball: "4", runs:   0, type: "dot",      desc: "Chahal flighted, defended"                  }
        ],

        /**
         * Wagon-wheel shots.
         * angle: degrees from straight (0 = bowler end / 12 o'clock), clockwise.
         * dist:  0–1 fraction of boundary radius.
         * runs:  0 | 1 | 2 | 4 | 6
         */
        wagonWheel: [
            { angle:  60, dist: 0.88, runs: 4 },
            { angle: 320, dist: 0.72, runs: 1 },
            { angle: 275, dist: 0.95, runs: 6 },
            { angle:   8, dist: 0.80, runs: 4 },
            { angle: 155, dist: 0.68, runs: 2 },
            { angle: 195, dist: 0.55, runs: 1 },
            { angle: 100, dist: 0.88, runs: 4 },
            { angle: 310, dist: 0.78, runs: 1 },
            { angle: 255, dist: 0.92, runs: 6 },
            { angle:  18, dist: 0.62, runs: 2 },
            { angle: 140, dist: 0.75, runs: 4 },
            { angle: 178, dist: 0.45, runs: 0 }
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
    ]
};
