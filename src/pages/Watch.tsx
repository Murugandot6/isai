const safeId = movieId.replace(/[^0-9]/g, '');
navigate(`/watch?movie=${safeId}`);