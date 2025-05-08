import { forwardRef, useState } from "react";
import { InputBase } from "~~/components/scaffold-eth/Input";
import { BuildCategory, BuildType } from "~~/services/database/config/types";
import { BuildInsert } from "~~/services/database/repositories/builds";

type Build = Omit<BuildInsert, "submittedTimestamp" | "id">;

type BuildFormModalProps = {
  closeModal: () => void;
  build?: Build;
};

export const BuildFormModal = forwardRef<HTMLDialogElement, BuildFormModalProps>(({ closeModal, build }, ref) => {
  const [form, setForm] = useState<Build>(
    build ?? {
      name: "",
      desc: "",
      buildType: BuildType.DAPP,
      buildCategory: BuildCategory.DEV_TOOLING,
      demoUrl: "",
      videoUrl: "",
      imageUrl: "",
      githubUrl: "",
    },
  );

  return (
    <dialog ref={ref} className="modal">
      <div className="modal-box flex flex-col space-y-3">
        <form method="dialog" className="bg-secondary -mx-6 -mt-6 px-6 py-4 flex items-center justify-between">
          <div className="flex justify-between items-center">
            <p className="font-bold text-xl m-0">New Build</p>
          </div>
          <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost text-xl h-auto">
            ✕
          </button>
        </form>

        <div className="flex flex-col space-y-5">
          <div className="flex flex-col gap-1.5 w-full">
            <div className="flex items-base ml-2">
              <span className="text-sm font-medium mr-2 leading-none">Build Name</span>
            </div>
            <InputBase
              placeholder="Build Name"
              value={form.name}
              onChange={value => setForm({ ...form, name: value })}
            />
          </div>
          <div className="flex flex-col gap-1.5 w-full">
            <div className="flex items-base ml-2">
              <span className="text-sm font-medium mr-2 leading-none">Description</span>
            </div>
            <div className="flex border-2 border-base-300 bg-base-200 rounded-xl text-accent">
              <textarea
                className="input input-ghost focus-within:border-transparent focus:outline-none focus:bg-transparent px-4 py-1 border w-full font-medium placeholder:text-accent/70 text-base-content/70 focus:text-base-content/70 rounded-xl min-h-24"
                placeholder="Description"
                name="desc"
                value={form.desc ?? ""}
                onChange={e => setForm({ ...form, desc: e.target.value })}
                autoComplete="off"
              />
            </div>
          </div>
          <div className="modal-action">
            <button className="btn btn-primary self-center">Submit</button>
          </div>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={closeModal}>close</button>
      </form>
    </dialog>
  );
});

BuildFormModal.displayName = "BuildFormModal";
