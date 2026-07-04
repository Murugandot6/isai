"use client";

import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Watch() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const movieId = searchParams.get('movie') || '';
  
  const safeId = movieId?.replace(/[^0-9]/g, '') ?? '';
  navigate(`/watch?movie=${safeId}`);

  return (
    <div>
      <h1>Watch</h1>
    </div>
  );
}