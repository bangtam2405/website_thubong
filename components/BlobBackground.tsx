import React from "react";

export default function BlobBackground({ className = "" }: { className?: string }) {
  return (
    <svg
      className={"absolute -top-20 -left-20 w-[600px] h-[600px] z-0 blur-2xl opacity-40 pointer-events-none select-none " + className}
      viewBox="0 0 600 600"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="blobGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#f9a8d4" />
        </radialGradient>
      </defs>
      <path>
        <animate attributeName="d" dur="10s" repeatCount="indefinite"
          values="M421,320Q420,390,350,420Q280,450,210,420Q140,390,140,320Q140,250,210,220Q280,190,350,220Q420,250,421,320Z;
                  M420,320Q420,390,350,420Q280,450,210,420Q140,390,140,320Q140,250,210,220Q280,190,350,220Q420,250,420,320Z;
                  M421,320Q420,390,350,420Q280,450,210,420Q140,390,140,320Q140,250,210,220Q280,190,350,220Q420,250,421,320Z" />
      </path>
    </svg>
  );
} 