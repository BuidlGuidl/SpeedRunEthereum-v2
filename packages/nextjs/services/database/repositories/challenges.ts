const fakeChallenges = [
  {
    id: "simple-nft",
    github: "scaffold-eth/se-2-challenges:challenge-0-simple-nft",
  },
  {
    id: "decentralized-staking",
    github: "scaffold-eth/se-2-challenges:challenge-1-decentralized-staking",
  },
  {
    id: "token-vendor",
    github: "scaffold-eth/se-2-challenges:challenge-2-token-vendor",
  },
  {
    id: "dice-game",
    github: "scaffold-eth/se-2-challenges:challenge-3-dice-game",
  },
];

// TODO. Query the database
export async function findChallengeById(id: string) {
  return fakeChallenges.find(challenge => challenge.id === id);
}

// TODO. Query the database
export async function getAllChallenges() {
  return fakeChallenges;
}
