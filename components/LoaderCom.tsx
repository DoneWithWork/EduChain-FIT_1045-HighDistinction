import React from "react";
import Skeleton from "react-loading-skeleton";

export default function LoaderCom() {
  return (
    <div className="max-h-80 max-w-[400px] h-full w-full overflow-hidden rounded-2xl  bg-linear-to-br from-[#16161a] to-[#1e1e27] p-0 m-0 space-y-3 animate-pulse">
      <Skeleton
        height={180}
        width="100%"
        baseColor="#2a2a34"
        highlightColor="#3a3a44"
        borderRadius={"16px"}
      />

      <div className="p-5 flex flex-col gap-3">
        <Skeleton
          height={30}
          width="80%"
          baseColor="#2a2a34"
          highlightColor="#3a3a44"
        />

        {/* Date skeleton */}
        <Skeleton
          height={25}
          width="40%"
          baseColor="#2a2a34"
          highlightColor="#3a3a44"
        />
      </div>
    </div>
  );
}
