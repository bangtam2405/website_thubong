"use client";
import React from 'react';
import styled from 'styled-components';

const Loader = () => {
  return (
    <StyledWrapper>
      <div className="spinner">
        <div className="dot" />
        <div className="dot" />
        <div className="dot" />
        <div className="dot" />
        <div className="dot" />
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .spinner {
   width: 60px;
   height: 60px;
   position: relative;
  }

  .spinner .dot {
   position: absolute;
   inset: 0;
   display: flex;
   justify-content: center;
  }

  .spinner .dot::after {
   content: "";
   width: 12px;
   height: 12px;
   border-radius: 50%;
   background-color: #ec4899;
  }

  @keyframes spin {
   to {
    transform: rotate(360deg);
   }
  }

  .spinner .dot {
   animation: spin 2s infinite;
  }

  .spinner .dot:nth-child(2) {
   animation-delay: 100ms;
  }

  .spinner .dot:nth-child(3) {
   animation-delay: 200ms;
  }

  .spinner .dot:nth-child(4) {
   animation-delay: 300ms;
  }

  .spinner .dot:nth-child(5) {
   animation-delay: 400ms;
  }
`;

export default Loader; 