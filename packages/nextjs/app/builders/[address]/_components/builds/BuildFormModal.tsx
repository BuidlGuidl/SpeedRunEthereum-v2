import { forwardRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Toaster } from "react-hot-toast";
import { TrashIcon } from "@heroicons/react/24/solid";
import { InputBase } from "~~/components/scaffold-eth/Input";
import { AddressInput } from "~~/components/scaffold-eth/Input/AddressInput";
import { BuildCategory, BuildType } from "~~/services/database/config/types";
import { Build } from "~~/services/database/repositories/builds";
import { notification } from "~~/utils/scaffold-eth";

export type BuildFormInputs = Omit<Build, "submittedTimestamp" | "id"> & {
  coBuilders: string[];
};

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
        coBuilders: [],
      },
    );
    const [isUploading, setIsUploading] = useState(false);

    const handleFormSubmit = async () => {
      const updatedForm = { ...form };

      updatedForm.demoUrl = updatedForm.demoUrl?.trim() ?? null;
      updatedForm.githubUrl = updatedForm.githubUrl?.trim() ?? null;
      updatedForm.imageUrl = updatedForm.imageUrl?.trim() ?? null;
      updatedForm.videoUrl = updatedForm.videoUrl?.trim() ?? null;

      if (!updatedForm.name) {
        notification.error("Build name is required");
        return;
      }
      if (updatedForm.demoUrl && !isValidUrl(updatedForm.demoUrl)) {
        notification.error("Demo URL is invalid. Please use the format https://example.com");
        return;
      }
      if (updatedForm.githubUrl && !isValidUrl(updatedForm.githubUrl)) {
        notification.error("GitHub URL is invalid. Please use the format https://github.com/user/repo");
        return;
      }
      if (updatedForm.imageUrl && !isValidUrl(updatedForm.imageUrl)) {
        notification.error("Image URL is invalid. Please use the format https://example.com/image.png");
        return;
      }
      if (updatedForm.videoUrl && updatedForm.videoUrl.length > 0 && !isValidYouTubeUrl(updatedForm.videoUrl)) {
        notification.error("Video URL must be a valid YouTube link");
        return;
      }
      buttonAction(updatedForm);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      accept: {
        "image/*": [],
      },
      maxSize: 10 * 1024 * 1024,
      onDrop: async acceptedFiles => {
        if (acceptedFiles && acceptedFiles.length > 0) {
          const file = acceptedFiles[0];
          const formData = new FormData();
          formData.append("file", file);

          setIsUploading(true);

          try {
            const response = await fetch("/api/builds/upload-img", {
              method: "POST",
              body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.error || "Failed to upload image");
            }

            setForm({ ...form, imageUrl: data.url });
            notification.success("Image uploaded successfully!");
          } catch (error) {
            console.error("Upload error:", error);
            notification.error("Failed to upload image");
          } finally {
            setIsUploading(false);
          }
        }
      },
      onDropRejected: rejectedFiles => {
        if (rejectedFiles[0]?.errors[0]?.code === "file-too-large") {
          notification.error("Image size exceeds the 10MB limit");
        } else if (rejectedFiles[0]?.errors[0]?.code === "file-invalid-type") {
          notification.error("File must be an image");
        } else {
          notification.error("File upload failed");
        }
      },
    });

    return (
      <dialog ref={ref} className="modal">
        <div className="modal-box flex flex-col space-y-3">
          <form method="dialog" className="bg-secondary -mx-6 -mt-6 px-6 py-4 flex items-center justify-between">
            <div className="flex justify-between items-center">
              <p className="font-bold text-xl m-0">{build ? "Edit Build" : "New Build"}</p>
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
                placeholder="https://example.com"
                value={form.demoUrl ?? ""}
                onChange={value => setForm({ ...form, demoUrl: value })}
              />
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <div className="flex items-base ml-2">
                <span className="text-sm font-medium mr-2 leading-none">GitHub URL</span>
              </div>
              <InputBase
                placeholder="https://github.com/user/repo"
                value={form.githubUrl ?? ""}
                onChange={value => setForm({ ...form, githubUrl: value })}
              />
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <div className="flex items-base ml-2">
                <span className="text-sm font-medium mr-2 leading-none">YouTube URL</span>
              </div>
              <InputBase
                placeholder="Video URL"
                value={form.videoUrl ?? ""}
                onChange={value => setForm({ ...form, videoUrl: value })}
              />
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <div className="flex items-center ml-2">
                <span className="text-base font-medium leading-none">Co-Builders</span>
                <button
                  type="button"
                  className="btn btn-sm h-6 min-h-6 p-0 w-6 btn-circle btn-ghost mt-0.5"
                  onClick={() => setForm({ ...form, coBuilders: [...form.coBuilders, ""] })}
                >
                  +
                </button>
              </div>
              {form.coBuilders.map((address, idx) => (
                <div key={idx} className="flex items-center gap-2 w-full">
                  <div className="flex-1">
                    <AddressInput
                      placeholder="Builder Address"
                      value={address}
                      onChange={val => {
                        console.log("val", val);
                        const updated = [...form.coBuilders];
                        updated[idx] = val;
                        setForm({ ...form, coBuilders: updated });
                        console.log("form", form);
                      }}
                    />
                  </div>

                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      const updated = form.coBuilders.filter((_, i) => i !== idx);
                      setForm({ ...form, coBuilders: updated });
                    }}
                    aria-label="Delete"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <div className="flex items-base ml-2">
                <span className="text-sm font-medium mr-2 leading-none">Image</span>
              </div>

              {!form.imageUrl ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
                    isDragActive ? "border-primary bg-primary/10" : "border-base-300 dark:border-base-content/20"
                  }`}
                >
                  <input {...getInputProps()} />
                  {isUploading ? (
                    <div className="flex flex-col items-center">
                      <span className="loading loading-spinner loading-md"></span>
                      <p className="mt-2">Uploading...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <p>Drag and drop an image here, or click to select</p>
                      <p className="text-xs mt-1 text-base-content/70">(Max size: 10MB, image files only)</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative w-full h-48 overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.imageUrl} alt="Build preview" className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-circle btn-error"
                      onClick={() => setForm({ ...form, imageUrl: "" })}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-action">
              <button
                className="btn btn-primary self-center"
                disabled={isPending || isUploading}
                onClick={handleFormSubmit}
              >
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
        <Toaster />
      </dialog>
    );
  },
);

BuildFormModal.displayName = "BuildFormModal";
