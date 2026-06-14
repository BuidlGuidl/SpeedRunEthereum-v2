import Favicon from "/public/favicon.ico";
import type { Metadata } from "next";

const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : `http://localhost:${process.env.PORT || 3000}`;
const titleTemplate = "%s | Speedrun Ethereum";

type GetMetadataArgs = {
  title: string;
  description: string;
  imageRelativePath?: string;
  canonicalPath?: string;
  robots?: Metadata["robots"];
};

export const getMetadata = ({
  title,
  description,
  imageRelativePath = "/thumbnail.png",
  canonicalPath,
  robots,
}: GetMetadataArgs): Metadata => {
  const imageUrl = `${baseUrl}${imageRelativePath}`;

  return {
    metadataBase: new URL(baseUrl),
    alternates: canonicalPath ? { canonical: canonicalPath } : undefined,
    title: {
      default: title,
      template: titleTemplate,
    },
    description: description,
    robots,
    openGraph: {
      title: {
        default: title,
        template: titleTemplate,
      },
      description: description,
      images: [
        {
          url: imageUrl,
        },
      ],
    },
    twitter: {
      title: {
        default: title,
        template: titleTemplate,
      },
      description: description,
      images: [imageUrl],
    },
    icons: [{ rel: "icon", url: Favicon.src }],
  };
};
