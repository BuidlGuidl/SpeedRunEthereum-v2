import Link from "next/link";

export const AdminMenuItems = ({ closeDropdown }: { closeDropdown: () => void }) => {
  const closeDropdownAndAdminMenu = () => {
    closeDropdown();
  };

  return (
    <>
      <li>
        <Link
          href={`/admin/batches`}
          className="btn-sm !rounded-xl flex gap-3 py-3"
          onClick={closeDropdownAndAdminMenu}
        >
          <span className="whitespace-nowrap">Batches</span>
        </Link>
      </li>
      <li>
        <Link
          href={`/admin/batch-builders`}
          className="btn-sm !rounded-xl flex gap-3 py-3"
          onClick={closeDropdownAndAdminMenu}
        >
          <span className="whitespace-nowrap">Batch Builders</span>
        </Link>
      </li>
    </>
  );
};
