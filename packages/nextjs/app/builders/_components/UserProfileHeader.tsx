interface UserProfileHeaderProps {
  challengesCount: number;
}

export const UserProfileHeader = ({ challengesCount }: UserProfileHeaderProps) => {
  return (
    <div className="bg-base-100 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold">{challengesCount}</div>
          <div className="text-neutral-content">challenges completed</div>
        </div>
      </div>
    </div>
  );
};
