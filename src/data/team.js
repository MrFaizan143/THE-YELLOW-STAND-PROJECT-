/**
 * team.js — TYS 2026 Data Layer
 * Single source of truth for all fixtures, squad, and staff data.
 * Update this file to reflect new fixtures or squad changes.
 */

export const DATA = {

  /** Next match details (used by countdown) */
  nextMatch: {
    date: "March 30, 2026 19:30:00",
    opponent: "RR",
    label: "March 30 vs RR",
  },

  /** Full fixture list */
  fixtures: [
    { d: "30 MAR", o: "Rajasthan Royals", v: "Guwahati" },
    { d: "03 APR", o: "Punjab Kings",     v: "Chennai"  },
    { d: "05 APR", o: "RCB",              v: "Bengaluru" },
    { d: "11 APR", o: "Delhi Capitals",   v: "Chennai"  },
  ],

  /** Squad organised by category */
  squad: {
    Batters: [
      "Ruturaj Gaikwad (C)",
      "Sarfaraz Khan",
      "Dewald Brevis",
      "Ayush Mhatre",
    ],
    Keepers: [
      "MS Dhoni",
      "Sanju Samson",
      "Urvil Patel",
      "Kartik Sharma",
    ],
    "All-Rounders": [
      "Shivam Dube",
      "Jamie Overton",
      "Matthew Short",
      "Aman Hakim Khan",
      "Prashant Veer",
      "R. Ghosh",
      "Zakary Foulkes",
    ],
    Bowlers: [
      "Khaleel Ahmed",
      "M. Choudhary",
      "Nathan Ellis",
      "Matt Henry",
      "Anshul Kamboj",
      "Gurjapneet Singh",
      "Noor Ahmad",
      "Rahul Chahar",
      "Akeal Hosein",
      "Shreyas Gopal",
    ],
  },

  /** Support staff: [role, name] pairs */
  staff: [
    ["Head Coach",    "Stephen Fleming"],
    ["Batting Coach", "Michael Hussey"],
    ["Bowling Cons.", "Eric Simons"],
    ["Fielding Coach","James Foster"],
    ["Team Manager",  "R. Radhakrishnan"],
    ["Doctor",        "Dr. Thottapillil"],
  ],
};
