import React from "react";
import Image from "next/image";
import Link from "next/link";

export const AfterSreCard = ({
  title,
  description,
  externalLink,
  previewImage,
  bgClassName,
  buttonText,
}: {
  title: string;
  description: string;
  externalLink: string;
  previewImage: string;
  bgClassName: string;
  buttonText: string;
}) => {
  return (
    <div className={`flex justify-center ${bgClassName}`}>
      <div className="relative flex w-full justify-between py-8 max-w-7xl xl:max-w-3xl mx-14 xl:mx-0 2xl:mx-14 pl-10 flex-col-reverse lg:flex-row border-l-[5px] xl:border-l-0 border-dashed border-primary">
        <span
          className={`absolute h-5 w-5 rounded-full bg-base-300 border-primary border-4 top-[58%] lg:top-1/2 -left-[13px] flex xl:hidden`}
        />

        <div className="flex flex-col items-start max-w-full lg:max-w-[40%]">
          <div className="flex flex-col items-start mt-0 lg:mt-[100px]">
            <h2 className="text-3xl lg:text-2xl font-medium mt-0">{title}</h2>
          </div>

          <div className="flex flex-col items-start space-y-4">
            <p className="text-lg lg:text-base leading-[1.5]">{description}</p>

            <Link
              href={externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 px-6 py-1.5 text-lg uppercase font-medium text-white bg-primary rounded-full hover:bg-secondary-content dark:text-gray-800 transition-colors"
            >
              {buttonText}
            </Link>
          </div>
        </div>

        <div className="flex justify-center items-center mb-6 lg:mb-0">
          <Image
            src={previewImage}
            alt={`${title} image`}
            // workaround to avoid console warnings
            className={`w-full max-w-[400px] h-auto lg:mr-12 ${previewImage.includes("techTree") ? "p-9" : "p-0"}`}
            width={0}
            height={0}
          />
        </div>
      </div>
    </div>
  );
};
