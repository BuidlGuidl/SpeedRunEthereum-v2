import { EIP_712_DOMAIN, isValidEip712Signature } from "./common";
import { BuildFormInputs } from "~~/app/builders/[address]/_components/builds/BuildFormModal";

export const EIP_712_TYPED_DATA__SUBMIT_BUILD = {
  domain: EIP_712_DOMAIN,
  types: {
    Message: [
      { name: "name", type: "string" },
      { name: "desc", type: "string" },
      { name: "buildType", type: "string" },
      { name: "buildCategory", type: "string" },
      { name: "demoUrl", type: "string" },
      { name: "videoUrl", type: "string" },
      { name: "imageUrl", type: "string" },
      { name: "githubUrl", type: "string" },
      { name: "coBuilders", type: "address[]" },
    ],
  },
  primaryType: "Message",
  message: {
    action: "Submit Build",
  },
} as const;

export const EIP_712_TYPED_DATA__UPDATE_BUILD = {
  domain: EIP_712_DOMAIN,
  types: {
    Message: [
      { name: "buildId", type: "string" },
      { name: "name", type: "string" },
      { name: "desc", type: "string" },
      { name: "buildType", type: "string" },
      { name: "buildCategory", type: "string" },
      { name: "demoUrl", type: "string" },
      { name: "videoUrl", type: "string" },
      { name: "imageUrl", type: "string" },
      { name: "githubUrl", type: "string" },
      { name: "coBuilders", type: "address[]" },
    ],
  },
  primaryType: "Message",
  message: {
    action: "Update Build",
  },
} as const;

export const EIP_712_TYPED_DATA__DELETE_BUILD = {
  domain: EIP_712_DOMAIN,
  types: {
    Message: [{ name: "id", type: "string" }],
  },
  primaryType: "Message",
  message: {
    action: "Delete Build",
  },
} as const;

export const isValidEIP712SubmitBuildSignature = async ({
  address,
  signature,
  build,
}: {
  address: string;
  signature: `0x${string}`;
  build: BuildFormInputs;
}) => {
  const typedData = {
    ...EIP_712_TYPED_DATA__SUBMIT_BUILD,
    message: {
      ...EIP_712_TYPED_DATA__SUBMIT_BUILD.message,
      ...build,
    },
    signature,
  };

  return await isValidEip712Signature({ typedData, address });
};

export const isValidEIP712UpdateBuildSignature = async ({
  address,
  signature,
  build,
}: {
  address: string;
  signature: `0x${string}`;
  build: BuildFormInputs & { buildId: string };
}) => {
  const buildWithDefaults = {
    ...build,
    desc: build.desc || "",
    buildType: build.buildType || "",
    buildCategory: build.buildCategory || "",
    demoUrl: build.demoUrl || "",
    videoUrl: build.videoUrl || "",
    imageUrl: build.imageUrl || "",
    githubUrl: build.githubUrl || "",
    coBuilders: build.coBuilders || [],
  };

  const typedData = {
    ...EIP_712_TYPED_DATA__UPDATE_BUILD,
    message: {
      ...EIP_712_TYPED_DATA__UPDATE_BUILD.message,
      ...buildWithDefaults,
    },
    signature,
  };

  return await isValidEip712Signature({ typedData, address });
};

export const isValidEIP712DeleteBuildSignature = async ({
  address,
  signature,
  buildId,
}: {
  address: string;
  signature: `0x${string}`;
  buildId: string;
}) => {
  const typedData = {
    ...EIP_712_TYPED_DATA__DELETE_BUILD,
    message: {
      ...EIP_712_TYPED_DATA__DELETE_BUILD.message,
      id: buildId,
    },
    signature,
  };

  return await isValidEip712Signature({ typedData, address });
};
