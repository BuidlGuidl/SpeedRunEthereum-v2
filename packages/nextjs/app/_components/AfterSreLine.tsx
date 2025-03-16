export const AfterSreLine = () => {
  return (
    <div className="hidden xl:flex justify-between w-full max-w-[min(80rem,calc(100vw-113px))] absolute top-0 h-48 mx-14">
      <div className="w-[calc(50%+110px)] h-[40px] border-l-[5px] border-primary border-dashed border-b-[5px] rounded-bl-[10px]" />
      <div className="absolute top-[35px] left-[105px] w-[20px] h-[40px] border-r-[5px] border-primary border-dashed rounded-tr-[10px] hidden xl:flex" />
      <span className="h-5 w-5 rounded-full bg-base-300 border-primary border-4 absolute top-[75px] left-[112px] flex" />
      <div className="absolute top-[35px] left-[calc(50%+100px)] w-[20px] h-[40px] border-r-[5px] border-primary border-dashed rounded-tr-[10px] hidden xl:flex" />
      <span className="h-5 w-5 rounded-full bg-base-300 border-primary border-4 absolute top-[75px] left-[calc(50%+108px)] flex" />
    </div>
  );
};
