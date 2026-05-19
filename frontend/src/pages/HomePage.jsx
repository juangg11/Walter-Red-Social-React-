import Feed from '../components/Feed';
import { CommunitiesSidebar, TrendingSidebar } from '../components/Sidebar';

export default function HomePage({ user, searchQuery, selectedCommunities, setSelectedCommunities, communities, onPostClick }) {
  return (
    <main className="main-content">
      <CommunitiesSidebar
        communities={communities}
        selectedCommunities={selectedCommunities}
        onSelectCommunities={setSelectedCommunities}
      />
      <Feed
        user={user}
        searchQuery={searchQuery}
        selectedCommunities={selectedCommunities}
        communities={communities}
      />
      <TrendingSidebar onPostClick={onPostClick} />
    </main>
  );
}
