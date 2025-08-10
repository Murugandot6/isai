// src/data/editorsPickPlaylists.js

// Helper to generate a unique ID (for mock data)
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

export const editorsPickPlaylists = [
  {
    id: generateId(),
    name: "kadhal vennila",
    genres: [{ id: "tamil", name: "Tamil" }],
    tracks: [
      {
        id: "8",
        name: "Kadhal Vennila",
        primaryArtists: "Hariharan",
        album: { name: "Kadhal Desam" },
        image: [{ link: "https://c.saavncdn.com/203/Kadhal-Desam-Tamil-1996-20230627170904-500x500.jpg" }],
        downloadUrl: [{ quality: "12kbps", link: "https://aac.saavncdn.com/203/128_kbps_Kadhal_Vennila.mp3" }],
        duration: 280,
        explicitContent: 0,
      },
      {
        id: "9",
        name: "Mustafa Mustafa",
        primaryArtists: "A.R. Rahman",
        album: { name: "Kadhal Desam" },
        image: [{ link: "https://c.saavncdn.com/203/Kadhal-Desam-Tamil-1996-20230627170904-500x500.jpg" }],
        downloadUrl: [{ quality: "12kbps", link: "https://aac.saavncdn.com/203/128_kbps_Mustafa_Mustafa.mp3" }],
        duration: 300,
        explicitContent: 0,
      },
    ],
  },
  {
    id: generateId(),
    name: "english vibes songs",
    genres: [{ id: "english", name: "English" }],
    tracks: [
      {
        id: "10",
        name: "Shape of You",
        primaryArtists: "Ed Sheeran",
        album: { name: "Divide" },
        image: [{ link: "https://c.saavncdn.com/873/Shape-of-You-English-2017-20170106170904-500x500.jpg" }],
        downloadUrl: [{ quality: "12kbps", link: "https://aac.saavncdn.com/873/128_kbps_Shape_of_You.mp3" }],
        duration: 230,
        explicitContent: 0,
      },
      {
        id: "11",
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
    name: "dope effect",
    genres: [{ id: "hiphop", name: "Hip-Hop" }],
    tracks: [
      {
        id: "12",
        name: "Sicko Mode",
        primaryArtists: "Travis Scott",
        album: { name: "Astroworld" },
        image: [{ link: "https://c.saavncdn.com/873/Astroworld-English-2018-20180803170904-500x500.jpg" }],
        downloadUrl: [{ quality: "12kbps", link: "https://aac.saavncdn.com/873/128_kbps_Sicko_Mode.mp3" }],
        duration: 320,
        explicitContent: 1,
      },
    ],
  },
  {
    id: generateId(),
    name: "just listen bro",
    genres: [{ id: "chill", name: "Chill" }],
    tracks: [
      {
        id: "13",
        name: "Circles",
        primaryArtists: "Post Malone",
        album: { name: "Hollywood's Bleeding" },
        image: [{ link: "https://c.saavncdn.com/873/Hollywoods-Bleeding-English-2019-20190906170904-500x500.jpg" }],
        downloadUrl: [{ quality: "12kbps", link: "https://aac.saavncdn.com/873/128_kbps_Circles.mp3" }],
        duration: 215,
        explicitContent: 0,
      },
    ],
  },
];