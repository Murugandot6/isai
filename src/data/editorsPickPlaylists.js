import generateUniqueId from '../utils/idGenerator';

const editorsPickPlaylists = [
  {
    id: generateUniqueId(),
    name: "Liked Songs",
    genres: [{ id: "pop", name: "Pop" }],
    tracks: [
      { id: "ls1", name: "Pasoori", primaryArtists: "Ali Sethi, Shae Gill", album: { name: "Pasoori" }, image: [{ link: "https://c.saavncdn.com/873/Pasoori-Urdu-2022-20220207170904-500x500.jpg" }], downloadUrl: [{ quality: "12kbps", link: "https://aac.saavncdn.com/873/128_kbps_Pasoori.mp3" }], duration: 200, explicitContent: 0 },
      { id: "ls2", name: "Excuses", primaryArtists: "AP Dhillon, Intense", album: { name: "Excuses" }, image: [{ link: "https://c.saavncdn.com/873/Excuses-English-2022-20220207170904-500x500.jpg" }], downloadUrl: [{ quality: "12kbps", link: "https://aac.saavncdn.com/873/128_kbps_Excuses.mp3" }], duration: 180, explicitContent: 0 },
    ],
    type: 'editors_pick',
  },
  {
    id: generateUniqueId(),
    name: "English Vibes Songs",
    genres: [{ id: "english", name: "English" }],
    tracks: [
      { id: "ev1", name: "Song C", primaryArtists: "Artist Z", album: { name: "Album 3" }, image: [{ link: "https://c.saavncdn.com/873/Summer-High-English-2022-20220207170904-500x500.jpg" }], downloadUrl: [{ quality: "12kbps", link: "https://aac.saavncdn.com/873/128_kbps_Summer_High.mp3" }], duration: 210, explicitContent: 0 },
      { id: "ev2", name: "Song D", primaryArtists: "Artist W", album: { name: "Album 4" }, image: [{ link: "https://c.saavncdn.com/873/Bad-Habits-English-2021-20210625170904-500x500.jpg" }], downloadUrl: [{ quality: "12kbps", link: "https://aac.saavncdn.com/873/128_kbps_Bad_Habits.mp3" }], duration: 190, explicitContent: 0 },
    ],
    type: 'editors_pick',
  },
  {
    id: generateUniqueId(),
    name: "Just Listen Bro",
    genres: [{ id: "chill", name: "Chill" }],
    tracks: [
      { id: "jlb1", name: "Song E", primaryArtists: "Artist P", album: { name: "Album 5" }, image: [{ link: "https://c.saavncdn.com/873/Blinding-Lights-English-2019-20191129170904-500x500.jpg" }], downloadUrl: [{ quality: "12kbps", link: "https://aac.saavncdn.com/873/128_kbps_Blinding_Lights.mp3" }], duration: 220, explicitContent: 0 },
    ],
    type: 'editors_pick',
  },
  {
    id: generateUniqueId(),
    name: "Oru Packet Ilaiyaraja",
    genres: [{ id: "tamil", name: "Tamil" }],
    tracks: [
      { id: "opi1", name: "Song F", primaryArtists: "Ilaiyaraja", album: { name: "Classic Hits" }, image: [{ link: "https://c.saavncdn.com/873/Perfect-English-2017-20170303170904-500x500.jpg" }], downloadUrl: [{ quality: "12kbps", link: "https://aac.saavncdn.com/873/128_kbps_Perfect.mp3" }], duration: 250, explicitContent: 0 },
    ],
    type: 'editors_pick',
  },
  {
    id: generateUniqueId(),
    name: "Sad Melodies Tamil",
    genres: [{ id: "sad", name: "Sad" }],
    tracks: [
      { id: "smt1", name: "Song G", primaryArtists: "Various Artists", album: { name: "Sad Hits" }, image: [{ link: "https://c.saavncdn.com/873/Shape-of-You-English-2017-20170106170904-500x500.jpg" }], downloadUrl: [{ quality: "12kbps", link: "https://aac.saavncdn.com/873/128_kbps_Shape_of_You.mp3" }], duration: 230, explicitContent: 0 },
    ],
    type: 'editors_pick',
  },
];

export default editorsPickPlaylists;