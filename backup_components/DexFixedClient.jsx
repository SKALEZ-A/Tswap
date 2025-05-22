import dynamic from 'next/dynamic';
import DexFixed from './DexFixed';

// Export a client-side only version of the DexFixed component
export default dynamic(() => Promise.resolve(DexFixed), { ssr: false });
