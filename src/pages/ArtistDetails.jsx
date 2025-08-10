import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetArtistDetailsQuery } from '../redux/services/saavnApi';
import { Loader, Error } from '../components/LoadersAndError'; // Corrected import path for Loader and Error

const ArtistDetails = ({}) => {
  const { id: artistId } = useParams();

  // This is the API call we need to inspect
  const { data: artistDetailsResult, isFetching, error } = useGetArtistDetailsQuery({ id: artistId });

  // This will log the raw data to your browser's console
  console.log('--- RAW API DATA ---');
  console.log(artistDetailsResult);
  console.log('--------------------');

  if (isFetching) return <Loader title="Getting raw data..." />;

  if (error) return <Error title="Error fetching raw data." />;

  return (
    <div className="p-4">
      <h1 className="text-white text-3xl">Raw API Response</h1>
      <p className="text-gray-400 mt-2">
        Please copy the object below, or open your developer console (F12) and copy the object logged under "RAW API DATA".
      </p>
      <pre className="text-white mt-4 bg-gray-800 p-4 rounded-lg overflow-auto text-xs">
        {JSON.stringify(artistDetailsResult, null, 2)}
      </pre>
    </div>
  );
};

export default ArtistDetails;