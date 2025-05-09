import Link from "next/link";

const adminMenuItems = [
  {
    label: "Activity",
    href: "/admin/activity",
  },
  {
    label: "Batches",
    href: "/admin/batches",
  },
  {
    label: "Batch Builders",
    href: "/admin/batch-builders",
  },
];
export const AdminMenuItems = ({ closeDropdown }: { closeDropdown: () => void }) => {
  return (
    <>
      {adminMenuItems.map(item => (
        <li key={item.href}>
          <Link href={item.href} className="btn-sm py-3 flex items-center" onClick={closeDropdown}>
            <span className="whitespace-nowrap">{item.label}</span>
          </Link>
        </li>
      ))}
    </>
  );
};
