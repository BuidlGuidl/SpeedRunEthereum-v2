import { forwardRef, useState } from "react";
import { InputBase } from "~~/components/scaffold-eth/Input";
import { BuildCategory, BuildType } from "~~/services/database/config/types";
import { Build } from "~~/services/database/repositories/builds";
import { notification } from "~~/utils/scaffold-eth";

export type BuildFormInputs = Omit<Build, "submittedTimestamp" | "id">;

type BuildFormModalProps = {
  closeModal: () => void;
  build?: BuildFormInputs;
  buttonAction: (build: BuildFormInputs) => void;
  buttonText: string;
  isPending: boolean;
};

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const isValidYouTubeUrl = (url: string) => {
  return /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/.test(
    url,
  );
};

export const BuildFormModal = forwardRef<HTMLDialogElement, BuildFormModalProps>(
  ({ closeModal, build, buttonAction, buttonText, isPending }, ref) => {
    const [form, setForm] = useState<BuildFormInputs>(
      build ?? {
        name: "",
        desc: "",
        buildType: BuildType.DAPP,
        buildCategory: BuildCategory.DEFI,
        demoUrl: "",
        videoUrl: "",
        imageUrl: "",
        githubUrl: "",
      },
    );

    const handleFormSubmit = async () => {
      if (!form.name) {
        notification.error("Build name is required");
        return;
      }
      if (form.demoUrl && !isValidUrl(form.demoUrl)) {
        notification.error("Demo URL is invalid");
        return;
      }
      if (form.githubUrl && !isValidUrl(form.githubUrl)) {
        notification.error("GitHub URL is invalid");
        return;
      }
      if (form.imageUrl && !isValidUrl(form.imageUrl)) {
        notification.error("Image URL is invalid");
        return;
      }
      if (form.videoUrl && form.videoUrl.length > 0 && !isValidYouTubeUrl(form.videoUrl)) {
        notification.error("Video URL must be a valid YouTube link");
        return;
      }
      buttonAction(form);
    };

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
            <div className="flex flex-col gap-1.5 w-full">
              <div className="flex items-base ml-2">
                <span className="text-sm font-medium mr-2 leading-none">Build Type</span>
              </div>
              <select
                className="select select-bordered bg-base-200 w-full rounded-full h-[2.2rem] min-h-[2.2rem] px-4"
                value={form.buildType ?? ""}
                onChange={e => setForm({ ...form, buildType: e.target.value as BuildType })}
              >
                {Object.values(BuildType).map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <div className="flex items-base ml-2">
                <span className="text-sm font-medium mr-2 leading-none">Build Category</span>
              </div>
              <select
                className="select select-bordered bg-base-200 w-full rounded-full h-[2.2rem] min-h-[2.2rem] px-4"
                value={form.buildCategory ?? ""}
                onChange={e => setForm({ ...form, buildCategory: e.target.value as BuildCategory })}
              >
                {Object.values(BuildCategory).map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <div className="flex items-base ml-2">
                <span className="text-sm font-medium mr-2 leading-none">Demo URL</span>
              </div>
              <InputBase
                placeholder="Demo URL"
                value={form.demoUrl ?? ""}
                onChange={value => setForm({ ...form, demoUrl: value })}
              />
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <div className="flex items-base ml-2">
                <span className="text-sm font-medium mr-2 leading-none">GitHub URL</span>
              </div>
              <InputBase
                placeholder="GitHub URL"
                value={form.githubUrl ?? ""}
                onChange={value => setForm({ ...form, githubUrl: value })}
              />
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <div className="flex items-base ml-2">
                <span className="text-sm font-medium mr-2 leading-none">Video URL</span>
              </div>
              <InputBase
                placeholder="Video URL"
                value={form.videoUrl ?? ""}
                onChange={value => setForm({ ...form, videoUrl: value })}
              />
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <div className="flex items-base ml-2">
                <span className="text-sm font-medium mr-2 leading-none">Image URL</span>
              </div>
              <InputBase
                placeholder="Image URL"
                value={form.imageUrl ?? ""}
                onChange={value => setForm({ ...form, imageUrl: value })}
              />
            </div>
            <div className="modal-action">
              <button className="btn btn-primary self-center" disabled={isPending} onClick={handleFormSubmit}>
                {isPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    {buttonText}
                  </>
                ) : (
                  buttonText
                )}
              </button>
            </div>
          </div>
        </div>
      </dialog>
    );
  },
);

BuildFormModal.displayName = "BuildFormModal";
