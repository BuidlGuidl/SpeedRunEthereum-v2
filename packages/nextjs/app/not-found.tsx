import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <div className="relative bg-base-300">
        <div className="absolute inset-0 bg-[url('/assets/home_header_clouds.svg')] bg-top bg-repeat-x bg-[length:auto_200px] sm:bg-[length:auto_300px]" />
        <div className="relative container mx-auto px-5 mb-11 flex flex-col items-center">
          <h1 className="mt-16 text-2xl font-semibold md:mt-32 md:text-5xl">Sorry! Page Not Found</h1>
          <Link className="mt-4 btn btn-primary md:mt-8 md:btn-lg" href="/">
            Return Home
          </Link>
        </div>
        <div className="relative h-[130px]">
          <div className="absolute inset-0 bg-[url('/assets/header_platform.svg')] bg-repeat-x bg-[length:auto_130px] z-10" />
          <div className="bg-base-200 absolute inset-0 top-auto w-full h-5" />
        </div>
      </div>
    </div>
  );
}
