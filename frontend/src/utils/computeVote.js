export function computeVote({ currentVote, voteType, votes }) {
  const next = currentVote === voteType ? null : voteType;
  let v = votes ?? 0;
  if (currentVote === 'up')   v -= 1;
  if (currentVote === 'down') v += 1;
  if (next === 'up')          v += 1;
  if (next === 'down')        v -= 1;
  return { nextVote: next, votes: Math.max(0, v) };
}