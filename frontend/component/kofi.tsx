// KoFiWidget.tsx
import React from "react";

const KoFiWidget: React.FC = () => {
  return (
    <iframe
      id="kofiframe"
      src="https://ko-fi.com/jaeminson/?hidefeed=true&widget=true&embed=true&preview=true"
      style={{
        border: 'black',
        width: '100%',
        background: 'white'
      }}
      height="712"
      title="jaeminson"
    ></iframe>
  );
};

export default KoFiWidget;
