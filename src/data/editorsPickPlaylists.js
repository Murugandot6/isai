import generateUniqueId from '../utils/idGenerator';

const editorsPickPlaylists = [
  {
    id: generateUniqueId(),
    name: "hindi thoda theriyum bhai",
    genres: [{ id: "hindi", name: "Hindi" }],
    tracks: [
      {
        id: generateUniqueId(),
        name: "Kesariya",
        primaryArtists: "Pritam, Arijit Singh",
        album: { name: "Brahmastra" },
        image: [{ link: "https://c.saavncdn.com/680/Kesariya-From-Brahmastra-Hindi-2022-20220717092734-500x500.jpg" }],
        downloadUrl: [{ quality: "128kbps", link: "https://aac.saavncdn.com/680/Kesariya-From-Brahmastra-Hindi-2022-20220717092734-128.mp3" }],
        duration: 250,
        explicitContent: 0,
      },
      {
        id: generateUniqueId(),
        name: "Deva Deva",
        primaryArtists: "Pritam, Arijit Singh, Jonita Gandhi",
        album: { name: "Brahmastra" },
        image: [{ link: "https://c.saavncdn.com/680/Deva-Deva-From-Brahmastra-Hindi-2022-20220808170904-500x500.jpg" }],
        downloadUrl: [{ quality: "128kbps", link: "https://aac.saavncdn.com/680/Deva-Deva-From-Brahmastra-Hindi-2022-20220808170904-128.mp3" }],
        duration: 280,
        explicitContent: 0,
      },
    ],
  },
  {
    id: generateUniqueId(),
    name: "kadhal vennila",
    genres: [{ id: "tamil", name: "Tamil" }],
    tracks: [
      {
        id: generateUniqueId(),
        name: "Kadhal Rojave",
        primaryArtists: "A.R. Rahman, S. P. Balasubrahmanyam",
        album: { name: "Roja" },
        image: [{ link: "https://c.saavncdn.com/205/Roja-Tamil-1992-20220717092734-500x500.jpg" }],
        downloadUrl: [{ quality: "128kbps", link: "https://aac.saavncdn.com/205/Kadhal-Rojave-Roja-Tamil-1992-128.mp3" }],
        duration: 300,
        explicitContent: 0,
      },
      {
        id: generateUniqueId(),
        name: "Vennilave Vennilave",
        primaryArtists: "Hariharan, Kavita Krishnamurthy",
        album: { name: "Minsara Kanavu" },
        image: [{ link: "https://c.saavncdn.com/205/Minsara-Kanavu-Tamil-1997-20220717092734-500x500.jpg" }],
        downloadUrl: [{ quality: "128kbps", link: "https://aac.saavncdn.com/205/Vennilave-Vennilave-Minsara-Kanavu-Tamil-1997-128.mp3" }],
        duration: 270,
        explicitContent: 0,
      },
    ],
  },
  {
    id: generateUniqueId(),
    name: "english vibe uh",
    genres: [{ id: "english", name: "English" }],
    tracks: [
      {
        id: generateUniqueId(),
        name: "Blinding Lights",
        primaryArtists: "The Weeknd",
        album: { name: "After Hours" },
        image: [{ link: "https://c.saavncdn.com/873/Blinding-Lights-English-2019-20191129170904-500x500.jpg" }],
        downloadUrl: [{ quality: "128kbps", link: "https://aac.saavncdn.com/873/128_kbps_Blinding_Lights.mp3" }],
        duration: 200,
        explicitContent: 0,
      },
      {
        id: generateUniqueId(),
        name: "Shape of You",
        primaryArtists: "Ed Sheeran",
        album: { name: "Divide" },
        image: [{ link: "https://c.saavncdn.com/873/Shape-of-You-English-2017-20170106170904-500x500.jpg" }],
        downloadUrl: [{ quality: "128kbps", link: "https://aac.saavncdn.com/873/128_kbps_Shape_of_You.mp3" }],
        duration: 230,
        explicitContent: 0,
      },
    ],
  },
  {
    id: generateUniqueId(),
    name: "Murugan old songs",
    genres: [{ id: "devotional", name: "Devotional" }],
    tracks: [
      {
        id: generateUniqueId(),
        name: "Azhagu Deivamaga",
        primaryArtists: "T.M. Soundararajan",
        album: { name: "Murugan Songs" },
        image: [{ link: "https://c.saavncdn.com/873/Murugan-Songs-Tamil-2000-20000101170904-500x500.jpg" }],
        downloadUrl: [{ quality: "128kbps", link: "https://aac.saavncdn.com/873/128_kbps_Azhagu_Deivamaga.mp3" }],
        duration: 240,
        explicitContent: 0,
      },
    ],
  },
  {
    id: generateUniqueId(),
    name: "oru packet ilaiyaraja",
    genres: [{ id: "tamil", name: "Tamil" }],
    tracks: [
      {
        id: generateUniqueId(),
        name: "Thenpandi Cheemayile",
        primaryArtists: "Ilaiyaraaja, S. P. Balasubrahmanyam",
        album: { name: "Nayagan" },
        image: [{ link: "https://c.saavncdn.com/873/Nayagan-Tamil-1987-20220717092734-500x500.jpg" }],
        downloadUrl: [{ quality: "128kbps", link: "https://aac.saavncdn.com/873/128_kbps_Thenpandi_Cheemayile.mp3" }],
        duration: 310,
        explicitContent: 0,
      },
    ],
  },
  {
    id: generateUniqueId(),
    name: "itha kelu",
    genres: [{ id: "tamil", name: "Tamil" }],
    tracks: [
      {
        id: generateUniqueId(),
        name: "Why This Kolaveri Di",
        primaryArtists: "Dhanush",
        album: { name: "3" },
        image: [{ link: "https://c.saavncdn.com/873/3-Tamil-2012-20220717092734-500x500.jpg" }],
        downloadUrl: [{ quality: "128kbps", link: "https://aac.saavncdn.com/873/128_kbps_Why_This_Kolaveri_Di.mp3" }],
        duration: 260,
        explicitContent: 0,
      },
    ],
  },
];

export default editorsPickPlaylists;