import React from "react";
import { useCarbonFootprint } from "react-carbon-footprint";

export default function CarbonFootprintDisplay() {
  const [gCO2 = 0, bytesTransferred = 0] = useCarbonFootprint();

  return (
    <div style={{
      position: 'fixed', bottom: 10, right: 10,
      background: 'rgba(255,255,255,0.8)', padding: '10px',
      borderRadius: '5px', zIndex: 1000
    }}>
      <h3 style={{ margin: '0 0 6px 0' }}>Network Carbon Footprint</h3>
      <div>Bytes Transferred: {bytesTransferred} bytes</div>
      <div>CO₂ Emissions: {Number(gCO2).toFixed(2)} g CO₂eq</div>
      <div style={{ fontSize: '0.8em', color: '#666' }}>
        (Estimate based on network data during this session)
      </div>
    </div>
  );
}