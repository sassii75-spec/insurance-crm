"use client";

import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div style={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center' }}>지도 불러오는 중...</div>
});

export default function SalesMapDashboard() {
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapComponent />
    </div>
  );
}
