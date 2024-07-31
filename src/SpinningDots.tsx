import React from "react";

const SpinningDots = () => {
  return (
    <div className="container">
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
      <style jsx>{`
        .container {
          --uib-size: 10vw;
          --uib-color: #814298;
          --uib-speed: 1.3s;
          --uib-dot-size: 25%;
          position: relative;
          display: inline-block;
          height: var(--uib-size);
          width: var(--uib-size);
          animation: spin var(--uib-speed) infinite linear;
        }

        .dot {
          position: absolute;
          left: calc(50% - var(--uib-dot-size) / 2);
          height: 100%;
          width: var(--uib-dot-size);
        }

        .dot:after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          height: 0%;
          width: 100%;
          padding-bottom: 100%;
          background-color: var(--uib-color);
          border-radius: 50%;
          transition: background-color 0.3s ease;
        }

        .dot:nth-child(1) {
          transform: rotate(120deg);
        }

        .dot:nth-child(1)::after {
          animation: wobble var(--uib-speed) infinite ease-in-out;
        }

        .dot:nth-child(2) {
          transform: rotate(-120deg);
        }

        .dot:nth-child(2)::after {
          animation: wobble var(--uib-speed) infinite ease-in-out;
        }

        .dot:nth-child(3)::after {
          animation: wobble var(--uib-speed) infinite ease-in-out;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes wobble {
          0%,
          100% {
            transform: translateY(0%);
          }
          50% {
            transform: translateY(65%);
          }
        }
      `}</style>
    </div>
  );
};

export default SpinningDots;
