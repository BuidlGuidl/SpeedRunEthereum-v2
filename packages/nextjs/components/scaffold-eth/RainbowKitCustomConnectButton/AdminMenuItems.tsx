import Link from "next/link";
import { AcademicCapIcon, CodeBracketSquareIcon, UserGroupIcon } from "@heroicons/react/24/outline";

const adminMenuItems = [
  {
    label: "Activity",
    href: "/admin/activity",
    icon: <CodeBracketSquareIcon className="w-4 h-6" />,
  },
  {
    label: "Batches",
    href: "/admin/batches",
    icon: <AcademicCapIcon className="w-4 h-6" />,
  },
  {
    label: "Batch Builders",
    href: "/admin/batch-builders",
    icon: <UserGroupIcon className="w-4 h-6" />,
  },
];
export const AdminMenuItems = ({ closeDropdown }: { closeDropdown: () => void }) => {
  return adminMenuItems.map(item => (
    <li key={item.href}>
      <Link href={item.href} className="btn-sm py-3 flex items-center gap-3" onClick={closeDropdown}>
        {item.icon}
        <span className="whitespace-nowrap">{item.label}</span>
      </Link>
    </li>
  ));
};
