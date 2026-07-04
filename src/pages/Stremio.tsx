"use client";

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function Stremio() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  const safeQuery = query?.replace(/[<>'`]/g, '') ?? '';
  setSearchParams({ q: safeQuery });

  return (
    <div>
      <h1>Stremio</h1>
    </div>
  );
}