import Communities from '../components/Comunidades';

export default function CommunitiesPage({ user, onCommunityCreated }) {
  return (
    <main className="page-shell">
      <Communities user={user} onCommunityCreated={onCommunityCreated} />
    </main>
  );
}
