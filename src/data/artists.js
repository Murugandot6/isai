const artists = [
  // Actors
  { id: '24800', name: 'Rajinikanth', type: 'Actor', image: 'https://c.saavncdn.com/artists/Rajinikanth_20230323062144_500x500.jpg' },
  { id: '24801', name: 'Kamal Haasan', type: 'Actor', image: 'https://c.saavncdn.com/artists/Kamal_Haasan_20230323062144_500x500.jpg' },
  { id: '24802', name: 'Vijay', type: 'Actor', image: 'https://c.saavncdn.com/artists/Vijay_20230323062144_500x500.jpg' },
  { id: '24803', name: 'Ajith Kumar', type: 'Actor', image: 'https://c.saavncdn.com/artists/Ajith_Kumar_20230323062144_500x500.jpg' },
  { id: '24804', name: 'Dhanush', type: 'Actor', image: 'https://c.saavncdn.com/artists/Dhanush_20230323062144_500x500.jpg' },
  { id: '24805', name: 'Suriya Sivakumar', type: 'Actor', image: 'https://c.saavncdn.com/artists/Suriya_20230323062144_500x500.jpg' },

  // Singers (Playback and Music Directors)
  { id: '15000', name: 'K. J. Yesudas', type: 'Singer', image: 'https://c.saavncdn.com/artists/K_J_Yesudas_20230323062144_500x500.jpg' },
  { id: '15001', name: 'K. S. Chithra', type: 'Singer', image: 'https://c.saavncdn.com/artists/K_S_Chithra_20230323062144_500x500.jpg' },
  { id: '15002', name: 'S. P. Balasubrahmanyam', type: 'Singer', image: 'https://c.saavncdn.com/artists/S_P_Balasubrahmanyam_20230323062144_500x500.jpg' },
  { id: '15003', name: 'Hariharan', type: 'Singer', image: 'https://c.saavncdn.com/artists/Hariharan_20230323062144_500x500.jpg' },
  { id: '15004', name: 'Swarnalatha', type: 'Singer', image: 'https://c.saavncdn.com/artists/Swarnalatha_20230323062144_500x500.jpg' },
  { id: '15005', name: 'Unnikrishnan', type: 'Singer', image: 'https://c.saavncdn.com/artists/Unnikrishnan_20230323062144_500x500.jpg' },
  { id: '15006', name: 'Mano', type: 'Singer', image: 'https://c.saavncdn.com/artists/Mano_20230323062144_500x500.jpg' },
  { id: '15007', name: 'Srinivas', type: 'Singer', image: 'https://c.saavncdn.com/artists/Srinivas_20230323062144_500x500.jpg' },
  { id: '15008', name: 'Karthik', type: 'Singer', image: 'https://c.saavncdn.com/artists/Karthik_20230323062144_500x500.jpg' },
  { id: '15009', name: 'Shreya Ghoshal', type: 'Singer', image: 'https://c.saavncdn.com/artists/Shreya_Ghoshal_20230323062144_500x500.jpg' },
  { id: '15010', name: 'Ilaiyaraaja', type: 'Music Director', image: 'https://c.saavncdn.com/artists/Ilaiyaraaja_20230323062144_500x500.jpg' },
  { id: '15011', name: 'A. R. Rahman', type: 'Music Director', image: 'https://c.saavncdn.com/artists/A_R_Rahman_20230323062144_500x500.jpg' },
  { id: '15012', name: 'Harris Jayaraj', type: 'Music Director', image: 'https://c.saavncdn.com/artists/Harris_Jayaraj_20230323062144_500x500.jpg' },
  { id: '15013', name: 'Yuvan Shankar Raja', type: 'Music Director', image: 'https://c.saavncdn.com/artists/Yuvan_Shankar_Raja_20230323062144_500x500.jpg' },

  // Directors / Writers / Producers
  { id: '30000', name: 'Mani Ratnam', type: 'Director', image: 'https://c.saavncdn.com/artists/Mani_Ratnam_20230323062144_500x500.jpg' },
  { id: '30001', name: 'S. Shankar', type: 'Director', image: 'https://c.saavncdn.com/artists/S_Shankar_20230323062144_500x500.jpg' },
  { id: '30002', name: 'Vetrimaaran', type: 'Director', image: 'https://c.saavncdn.com/artists/Vetrimaaran_20230323062144_500x500.jpg' },
  { id: '30003', name: 'Pa. Ranjith', type: 'Director', image: 'https://c.saavncdn.com/artists/Pa_Ranjith_20230323062144_500x500.jpg' },
  { id: '30004', name: 'S. J. Suryah', type: 'Director', image: 'https://c.saavncdn.com/artists/S_J_Suryah_20230323062144_500x500.jpg' },
  { id: '30005', name: 'K. S. Ravikumar', type: 'Director', image: 'https://c.saavncdn.com/artists/K_S_Ravikumar_20230323062144_500x500.jpg' },
  { id: '30006', name: 'Cheran', type: 'Director', image: 'https://c.saavncdn.com/artists/Cheran_20230323062144_500x500.jpg' },
  { id: '30007', name: 'Parthiban', type: 'Director', image: 'https://c.saavncdn.com/artists/Parthiban_20230323062144_500x500.jpg' },
  { id: '30008', name: 'Bhagyaraj', type: 'Director', image: 'https://c.saavncdn.com/artists/Bhagyaraj_20230323062144_500x500.jpg' },
  { id: '30009', name: 'A. R. Murugadoss', type: 'Director', image: 'https://c.saavncdn.com/artists/A_R_Murugadoss_20230323062144_500x500.jpg' },
  { id: '30010', name: 'Balu Mahendra', type: 'Director', image: 'https://c.saavncdn.com/artists/Balu_Mahendra_20230323062144_500x500.jpg' },
  { id: '30011', name: 'Bharathiraja', type: 'Director', image: 'https://c.saavncdn.com/artists/Bharathiraja_20230323062144_500x500.jpg' },
  { id: '30012', name: 'K. Balachander', type: 'Director', image: 'https://c.saavncdn.com/artists/K_Balachander_20230323062144_500x500.jpg' },
];

export default artists;