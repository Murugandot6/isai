// src/data/editorsPickPlaylists.js

// Helper to generate a unique ID (for mock data)
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

export const editorsPickPlaylists = [
  {
    id: generateId(),
    name: "Chill Vibes",
    genres: [{ id: "chill", name: "Chill" }],
    tracks: [
      {
        id: "1",
        name: "Pasoori",
        primaryArtists: "Ali Sethi, Shae Gill",
        album: { name: "Pasoori" },
        image: [{ link: "https://c.saavncdn.com/873/Pasoori-Urdu-2022-20220207170904-500x500.jpg" }],
        downloadUrl: [{ quality: "12kbps", link: "https://aac.saavncdn.com/873/128_kbps_Pasoori.mp3" }],
        duration: 200,
        explicitContent: 0,
      },
      {
        id: "2",
        name: "Excuses",
        primaryArtists: "AP Dhillon, Intense",
        album: { name: "Excuses" },
        image: [{ link: "https://c.saavncdn.com/873/Excuses-English-2022-20220207170904-500x500.jpg" }],
        downloadUrl: [{ quality: "12kbps", link: "https://aac.saavncdn.com/873/128_kbps_Excuses.mp3" }],
        duration: 180,
        explicitContent: 0,
      },
      {
        id: "3",
        name: "Summer High",
        primaryArtists: "Sidhu Moose Wala",
        album: { name: "Summer High" },
        image: [{ link: "https://c.saavncdn.com/873/Summer-High-English-2022-20220207170904-500x500.jpg" }],
        downloadUrl: [{ quality: "12kbps", link: "https://aac.saavncdn.com/873/128_kbps_Summer_High.mp3" }],
        duration: 210,
        explicitContent: 0,
      },
    ],
  },
  {
    id: generateId(),
    name: "Workout Jams",
    genres: [{ id: "workout", name: "Workout" }],
    tracks: [
      {
        id: "4",
        name: "Bad Habits",
        primaryArtists: "Ed Sheeran",
        album: { name: "Equals" },
        image: [{ link: "https://c.saavncdn.com/873/Bad-Habits-English-2021-20210625170904-500x500.jpg" }],
        downloadUrl: [{ quality: "12kbps", link: "https://aac.saavncdn.com/873/128_kbps_Bad_Habits.mp3" }],
        duration: 230,
        explicitContent: 0,
      },
      {
        id: "5",
        name: "Blinding Lights",
        primaryArtists: "The Weeknd",
        album: { name: "After Hours" },
        image: [{ link: "https://c.saavncdn.com/873/Blinding-Lights-English-2019-20191129170904-500x500.jpg" }],
        downloadUrl: [{ quality: "12kbps", link: "https://aac.saavncdn.com/873/128_kbps_Blinding_Lights.mp3" }],
        duration: 200,
        explicitContent: 0,
      },
    ],
  },
  {
    id: generateId(),
    name: "Focus & Study",
    genres: [{ id: "study", name: "Study" }],
    tracks: [
      {
        id: "6",
        name: "Perfect",
        primaryArtists: "Ed Sheeran",
        album: { name: "Divide" },
        image: [{ link: "https://c.saavncdn.com/873/Perfect-English-2017-20170303170904-500x500.jpg" }],
        downloadUrl: [{ quality: "12kbps", link: "https://aac.saavncdn.com/873/128_kbps_Perfect.mp3" }],
        duration: 260,
        explicitContent: 0,
      },
      {
        id: "7",
        name: "Shape of You",
        primaryArtists: "Ed Sheeran",
        album: { name: "Divide" },
        image: [{ link: "https://c.saavncdn.com/873/Shape-of-You-English-2017-20170106170904-500x500.jpg" }],
        downloadUrl: [{ quality: "12kbps", link: "https://aac.saavncdn.com/873/128_kbps_Shape_of_You.mp3" }],
        duration: 230,
        explicitContent: 0,
      },
    ],
  },
];