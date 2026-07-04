import { useDebounce } from '@hookform/resolvers';

const debouncedQuery = useDebounce(searchQuery, 500);