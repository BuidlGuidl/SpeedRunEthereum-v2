import { SKILL_LEVELS, SkillLevel } from "~~/utils/challenges";

type SkillLevelIconProps = {
  level?: SkillLevel;
  className?: string;
};

const SkillLevelIcon = ({ level, className = "w-8 h-8 text-primary" }: SkillLevelIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className={className}
    >
      {level && <path fill="currentColor" d="M4.375 12.75h1.75v7.5h-1.75Z" />}
      {(level === SKILL_LEVELS.INTERMEDIATE || level === SKILL_LEVELS.ADVANCED) && (
        <path fill="currentColor" d="M11.125 8.25h1.75v12.75h-1.75Z" />
      )}
      {level === SKILL_LEVELS.ADVANCED && <path fill="currentColor" d="M17.875 4.5h1.75v15h-1.75Z" />}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
      />
    </svg>
  );
};

export default SkillLevelIcon;
